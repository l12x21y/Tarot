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
  onStartNewReading: () => void;
}

const MIRROR_VALIDATION_MAX_RETRIES = 2;

type ClosureStage = "chat" | "reflect" | "done";

type SessionLogEntry = {
  role: "user" | "assistant";
  content: string;
  ts: number;
};

const LOCAL_STORAGE_KEY = "interpretive_friction_sessions";

const isSynthesisLike = (text: string): boolean => {
  const t = text.toLowerCase();
  return (
    t.includes("synthesis") ||
    t.includes("to synthesize") ||
    t.includes("in summary") ||
    t.includes("to sum up") ||
    t.includes("overall") ||
    t.includes("takeaway") ||
    t.includes("in the end") ||
    t.includes("what i'm hearing") ||
    t.includes("what i’m hearing")
  );
};

export const Reading = ({
  mode,
  card,
  orientation,
  inquiry,
  onStartNewReading
}: ReadingProps) => {
  const modeConfig = MODES[mode];
  const [messages, setMessages] = useState<ReadingThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const historyRef = useRef<ChatMessageType[]>([{ role: "user", content: modeConfig.initialTrigger }]);
  const sessionStartTsRef = useRef<number>(Date.now());
  const conversationLogRef = useRef<SessionLogEntry[]>([
    { role: "user", content: modeConfig.initialTrigger, ts: sessionStartTsRef.current }
  ]);
  const synthesisReachedRef = useRef(false);
  const [closureStage, setClosureStage] = useState<ClosureStage>("chat");
  const [reflection, setReflection] = useState("");
  const [completeEnabled, setCompleteEnabled] = useState(false);
  const [completePulse, setCompletePulse] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const system = useMemo(
    () => buildSystemPrompt(mode, card, inquiry, orientation),
    [mode, card, inquiry, orientation]
  );

  const userVisibleMessageCount = (): number => {
    // Exclude the hidden trigger (first user message).
    return historyRef.current.filter((m, idx) => m.role === "user" && idx !== 0).length;
  };

  const updateCompletionAvailability = () => {
    const meetsMinTurns = userVisibleMessageCount() >= 6;
    const meetsSynthesis = synthesisReachedRef.current;
    const enabled = meetsMinTurns || meetsSynthesis;
    setCompleteEnabled(enabled);
    setCompletePulse(enabled && closureStage === "chat");
  };

  const askModel = async (newUserInput?: string) => {
    setLoading(true);
    try {
      if (newUserInput) {
        const userMessage = { role: "user", content: newUserInput } as const;
        setMessages((prev) => [...prev, userMessage]);
        historyRef.current = [...historyRef.current, userMessage];
        conversationLogRef.current = [
          ...conversationLogRef.current,
          { role: "user", content: newUserInput, ts: Date.now() }
        ];
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
      conversationLogRef.current = [
        ...conversationLogRef.current,
        { role: "assistant", content: response, ts: Date.now() }
      ];
      if (!synthesisReachedRef.current && isSynthesisLike(response)) {
        synthesisReachedRef.current = true;
      }
      updateCompletionAvailability();

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
    updateCompletionAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closureStage]);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submitReflection = () => {
    const now = Date.now();
    const record = {
      mode,
      card: {
        name: card.name,
        orientation
      },
      inquiry,
      conversationLog: conversationLogRef.current,
      annotations: null as null,
      reflection: reflection.trim(),
      timestamps: {
        sessionStart: sessionStartTsRef.current,
        reflectionSubmitted: now,
        completed: now
      }
    };

    console.log("[Session record]", record);

    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
      const next = Array.isArray(existing) ? [...existing, record] : [record];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("[Session record] failed to save to localStorage", e);
    }

    setClosureStage("done");
    setCompletePulse(false);
  };

  if (closureStage === "done") {
    return (
      <main className="page completion-screen">
        <h2>Thank you for your reading.</h2>
        <p className="dim">Your reflection has been recorded.</p>
        <button className="primary" onClick={onStartNewReading}>
          Start New Reading
        </button>
      </main>
    );
  }

  return (
    <main className="reading-layout">
      <aside className="reading-left">
        <div className="mode-chip" style={{ borderColor: modeConfig.color }}>
          <span>{modeConfig.icon}</span>
          <strong>{modeConfig.name}</strong>
        </div>
        <div className="reading-left-content">
          <img
            src={card.image}
            alt={card.name}
            className={`left-card${orientation === "reversed" ? " card-img--reversed" : ""}`}
          />
          <h3>{card.name}</h3>
          <p className="card-orientation-label">
            {orientation === "upright" ? "Upright" : "Reversed"}
          </p>
        </div>

        <div className="reading-left-footer">
          <button
            type="button"
            className={`complete-reading-btn${completePulse ? " is-pulsing" : ""}`}
            disabled={!completeEnabled || loading || closureStage !== "chat"}
            style={
              completeEnabled
                ? { borderColor: modeConfig.color, color: modeConfig.color }
                : undefined
            }
            onClick={() => setClosureStage("reflect")}
          >
            Complete Reading
          </button>
        </div>
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
        {closureStage === "chat" ? (
          <ChatInput
            color={modeConfig.color}
            placeholder={modeConfig.inputPlaceholder}
            disabled={loading}
            onSend={async (value) => {
              await askModel(value);
            }}
          />
        ) : (
          <div className="reflection-box">
            <h3>Before we close, take a moment to reflect:</h3>
            <p className="dim">
              How would you describe your understanding of your original concern now? Has anything shifted in how you see the situation?
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={6}
              placeholder="Write your reflection here..."
            />
            <div className="reflection-actions">
              <button
                type="button"
                className="primary"
                disabled={!reflection.trim()}
                onClick={submitReflection}
                style={{ borderColor: modeConfig.color, color: modeConfig.color }}
              >
                Submit Reflection
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => setClosureStage("chat")}
              >
                Back to Chat
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
