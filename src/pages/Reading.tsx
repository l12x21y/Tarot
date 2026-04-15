import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MODES } from "../constants";
import { buildSystemPrompt } from "../prompts/systemPrompts";
import { sendChatToLlm } from "../services/llmService";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { DialogueInterpretationCards } from "../components/DialogueInterpretationCards";
import { parseDialogueStructuredResponse } from "../utils/parseDialogueStructured";
import { validateMirrorResponse } from "../utils/validateMirrorResponse";
import type {
  CardOrientation,
  ChatMessage as ChatMessageType,
  ModeId,
  ReadingThreadMessage,
  TarotCard
} from "../types";

interface ReadingProps {
  mode: ModeId;
  card: TarotCard;
  orientation: CardOrientation;
  inquiry: string;
}

const MIRROR_VALIDATION_MAX_RETRIES = 2;

export const Reading = ({ mode, card, orientation, inquiry }: ReadingProps) => {
  const modeConfig = MODES[mode];
  const [messages, setMessages] = useState<ReadingThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const historyRef = useRef<ChatMessageType[]>([{ role: "user", content: modeConfig.initialTrigger }]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const system = useMemo(
    () => buildSystemPrompt(mode, card, inquiry, orientation),
    [mode, card, inquiry, orientation]
  );

  const askModel = async (newUserInput?: string) => {
    setLoading(true);
    try {
      if (newUserInput) {
        const userMessage = { role: "user", content: newUserInput } as const;
        setMessages((prev) => [...prev, userMessage]);
        historyRef.current = [...historyRef.current, userMessage];
      }
      let response: string;
      if (mode === "mirror") {
        let systemUsed = system;
        for (let attempt = 0; attempt <= MIRROR_VALIDATION_MAX_RETRIES; attempt++) {
          response = await sendChatToLlm({
            system: systemUsed,
            messages: historyRef.current,
            mode
          });
          const validation = validateMirrorResponse(response);
          console.log("[Mirror validation]", {
            attempt,
            pass: validation.valid,
            issues: validation.issues,
            textPreview: response.slice(0, 160)
          });
          if (validation.valid) {
            break;
          }
          if (attempt === MIRROR_VALIDATION_MAX_RETRIES) {
            console.warn(
              "[Mirror validation] failed after max retries; showing last response anyway",
              { issues: validation.issues }
            );
            break;
          }
          systemUsed =
            `${system}\n\nYour previous response contained these issues:\n${validation.issues
              .map((issue) => `- ${issue}`)
              .join(
                "\n"
              )}\nRemember: in Mirror Mode you must ONLY ask questions, questions must not contain interpretive frames, and you should ask only ONE question at a time. Please try again.`;
        }
      } else {
        response = await sendChatToLlm({
          system,
          messages: historyRef.current,
          mode
        });
      }

      const assistantMessage = { role: "assistant", content: response } as const;
      historyRef.current = [...historyRef.current, assistantMessage];

      const isDialogueFirstTurn = mode === "dialogue" && newUserInput === undefined;
      if (isDialogueFirstTurn) {
        const parsed = parseDialogueStructuredResponse(response);
        if (parsed) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", dialogueStructured: parsed }
          ]);
        } else {
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } else {
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errText = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errText}` }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    void askModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  return (
    <main className="reading-layout">
      <aside className="reading-left">
        <div className="mode-chip" style={{ borderColor: modeConfig.color }}>
          <span>{modeConfig.icon}</span>
          <strong>{modeConfig.name}</strong>
        </div>
        <img
          src={card.image}
          alt={card.name}
          className={`left-card${orientation === "reversed" ? " card-img--reversed" : ""}`}
        />
        <h3>{card.name}</h3>
        <p className="card-orientation-label">
          {orientation === "upright" ? "Upright" : "Reversed"}
        </p>
      </aside>
      <section className="reading-right">
        <header>
          <strong>Your concern:</strong> <span title={inquiry}>{inquiry}</span>
        </header>
        <div className="chat-area" ref={viewportRef}>
          {messages.map((message, idx) => {
            if (message.role === "assistant" && "dialogueStructured" in message) {
              return (
                <div key={`dialogue-structured-${idx}`} className="dialogue-structured-turn">
                  <motion.div
                    className="message assistant dialogue-interpretation-message"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ borderColor: modeConfig.color }}
                  >
                    <small style={{ color: modeConfig.color }}>
                      {modeConfig.roleLabel}
                    </small>
                    <DialogueInterpretationCards
                      data={message.dialogueStructured}
                      accentColor={modeConfig.color}
                    />
                  </motion.div>
                  <ChatMessage
                    message={{
                      role: "assistant",
                      content: message.dialogueStructured.invitation
                    }}
                    mode={modeConfig}
                  />
                </div>
              );
            }
            return (
              <ChatMessage
                key={`${message.role}-${idx}`}
                message={message}
                mode={modeConfig}
              />
            );
          })}
          {loading && (
            <div className="loading" style={{ color: modeConfig.color }}>
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <ChatInput
          color={modeConfig.color}
          placeholder={modeConfig.inputPlaceholder}
          disabled={loading}
          onSend={async (value) => {
            await askModel(value);
          }}
        />
      </section>
    </main>
  );
};
