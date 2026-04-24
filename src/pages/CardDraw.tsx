import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CardBack } from "../components/CardBack";
import { MODES } from "../constants";
import type { CardOrientation, ModeId, TarotCard } from "../types";

const DISPLAY_CARD_COUNT = 14;
const TABLE_PERSPECTIVE_X_DEG = 60;
const SPREAD_STEP_MS = 95;

type DrawStage = "shuffle" | "spreading" | "choose";

interface CardDrawProps {
  mode: ModeId;
  inquiry: string;
  preAppraisal: string;
  selectedCard: TarotCard | null;
  orientation: CardOrientation;
  selectedSlot: number | null;
  onInquiryChange: (text: string) => void;
  onPreAppraisalChange: (text: string) => void;
  onDraw: (index: number) => void;
  onBegin: () => void;
}

export const CardDraw = ({
  mode,
  inquiry,
  preAppraisal,
  selectedCard,
  orientation,
  selectedSlot,
  onInquiryChange,
  onPreAppraisalChange,
  onDraw,
  onBegin
}: CardDrawProps) => {
  const modeConfig = MODES[mode];
  const [phase, setPhase] = useState<"ask" | "appraisal" | "draw">("ask");
  const [drawStage, setDrawStage] = useState<DrawStage>("shuffle");
  const [spreadProgress, setSpreadProgress] = useState(-1);

  useEffect(() => {
    if (phase !== "draw") return;
    setDrawStage("shuffle");
    setSpreadProgress(-1);
  }, [phase]);

  useEffect(() => {
    if (drawStage !== "spreading") return;
    setSpreadProgress(-1);
    const timer = window.setInterval(() => {
      setSpreadProgress((prev) => {
        const next = prev + 1;
        if (next >= DISPLAY_CARD_COUNT - 1) {
          window.clearInterval(timer);
          setDrawStage("choose");
          return DISPLAY_CARD_COUNT - 1;
        }
        return next;
      });
    }, SPREAD_STEP_MS);

    return () => window.clearInterval(timer);
  }, [drawStage]);

  return (
    <motion.main
      className={`page page--carddraw${phase === "draw" && selectedCard ? " page--carddraw-selected" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mode-chip" style={{ borderColor: modeConfig.color }}>
        <span>{modeConfig.icon}</span>
        <strong>{modeConfig.name}</strong>
      </div>

      {phase === "ask" && !selectedCard && (
        <section className="inquiry-box">
          <h2>What's on your mind?</h2>
          <p>Describe a question, concern, or situation you'd like to explore.</p>
          <textarea
            value={inquiry}
            onChange={(e) => onInquiryChange(e.target.value)}
            placeholder="e.g. I'm struggling with a career decision and feel pulled in two directions..."
            rows={6}
          />
          <button
            className="primary"
            disabled={!inquiry.trim()}
            onClick={() => setPhase("appraisal")}
          >
            Draw a Card
          </button>
        </section>
      )}

      {phase === "appraisal" && !selectedCard && (
        <section className="appraisal-box">
          <h2>Before we begin...</h2>
          <p>
            Take a moment to describe how you currently see this situation. How do you frame the
            problem? What do you think your options are? What feels most true to you right now?
          </p>
          <textarea
            value={preAppraisal}
            onChange={(e) => onPreAppraisalChange(e.target.value)}
            placeholder="e.g. I feel like I have to choose between security and fulfillment. Part of me thinks staying is the responsible choice, but another part feels like I'm settling..."
            rows={6}
          />
          <button
            className="primary"
            disabled={!preAppraisal.trim()}
            onClick={() => setPhase("draw")}
          >
            Continue to Draw
          </button>
        </section>
      )}

      {phase === "draw" && (
        <section className={`draw-box${selectedCard ? " draw-box--selected" : ""}`}>
          <h2>
            {drawStage === "shuffle"
              ? "Cutting the deck"
              : !selectedCard
                ? "Choose a card"
                : "Your card"}
          </h2>
          <p>
            {drawStage === "shuffle"
              ? "Hold your question in mind. Freeze this order when it feels right."
              : "Choose one card from the spread."}
          </p>

          <div
            className={`selected-flip-stage${selectedCard ? " has-card" : ""}`}
            aria-live="polite"
          >
            {selectedCard && (
              <motion.div
                key={`${selectedCard.id}-${orientation}`}
                className="selected-flip-shell"
                initial={{ y: 96, scale: 0.9, rotateY: 0, opacity: 0 }}
                animate={{ y: 0, scale: 1, rotateY: 180, opacity: 1 }}
                transition={{ duration: 0.82, ease: "easeInOut" }}
              >
                <div className="selected-flip-front">
                  <CardBack className="selected-flip-back-design" onClick={() => undefined} disabled />
                </div>
                <div className="selected-flip-back">
                  <img
                    src={selectedCard.image}
                    alt={selectedCard.name}
                    className={`selected-flip-img${orientation === "reversed" ? " card-img--reversed" : ""}`}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {selectedCard && (
            <motion.div
              className="selected-info-inline"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h3>{selectedCard.name}</h3>
              <p className="card-orientation-label">
                {orientation === "upright" ? "Upright" : "Reversed"}
              </p>
              <button className="primary" onClick={onBegin}>
                Begin Reading →
              </button>
            </motion.div>
          )}

          {drawStage === "shuffle" && !selectedCard ? (
            <div className="shuffle-stage">
              <div className="shuffle-deck" aria-hidden>
                <motion.div
                  className="shuffle-layer shuffle-layer-1"
                  animate={{ x: [0, -18, 16, 0], rotate: [0, -5, 3, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CardBack className="card-back--compact" onClick={() => undefined} disabled />
                </motion.div>
                <motion.div
                  className="shuffle-layer shuffle-layer-2"
                  animate={{ x: [0, 18, -14, 0], rotate: [0, 5, -3, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.12 }}
                >
                  <CardBack className="card-back--compact" onClick={() => undefined} disabled />
                </motion.div>
                <motion.div
                  className="shuffle-layer shuffle-layer-3"
                  animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut", delay: 0.08 }}
                >
                  <CardBack className="card-back--compact" onClick={() => undefined} disabled />
                </motion.div>
              </div>
              <button className="primary" onClick={() => setDrawStage("spreading")}>
                Keep This Order
              </button>
            </div>
          ) : (
            <div className={`arc-spread-wrap${selectedCard ? " has-selected-card" : ""}`}>
              <div className="arc-spread" role="list" aria-label="Tarot spread">
                {Array.from({ length: DISPLAY_CARD_COUNT }).map((_, index) => {
                  const total = DISPLAY_CARD_COUNT;
                  const center = (total - 1) / 2;
                  const t = center === 0 ? 0 : (index - center) / center;
                  const lift = (1 - t * t) * 86;
                  const angle = -t * 18;
                  const isPicked = selectedSlot === index;
                  const isRevealed = drawStage !== "spreading" || index <= spreadProgress;
                  const sourceX = -420 + index * 36;

                  return (
                    <motion.div
                      key={index}
                      className={`arc-card${isPicked ? " is-picked" : ""}`}
                      role="listitem"
                      initial={{ opacity: 0, x: sourceX, y: 10, rotate: -4, rotateX: 0 }}
                      animate={{
                        opacity: isRevealed ? (selectedCard && !isPicked ? 0.45 : 1) : 0,
                        x: isRevealed ? 0 : sourceX,
                        y: isRevealed ? (isPicked ? lift - 52 : lift) : 10,
                        rotate: isRevealed ? angle : -4,
                        rotateX: isRevealed ? TABLE_PERSPECTIVE_X_DEG : 0,
                        scale: isRevealed ? (isPicked ? 1.06 : 1) : 0.98
                      }}
                      transition={{
                        duration: drawStage === "spreading" ? 0.46 : 0.32,
                        ease: "easeOut"
                      }}
                      style={{ zIndex: isPicked ? 999 : 200 + index }}
                    >
                      <CardBack
                        className="card-back--compact"
                        onClick={() => onDraw(index)}
                        disabled={!!selectedCard || drawStage !== "choose" || !isRevealed}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}


    </motion.main>
  );
};
