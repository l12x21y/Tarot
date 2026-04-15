import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CardBack } from "../components/CardBack";
import { CardFace } from "../components/CardFace";
import { MODES } from "../constants";
import type { CardOrientation, ModeId, TarotCard } from "../types";

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

  return (
    <motion.main className="page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
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
        <section className="draw-box">
          <h2>{!selectedCard ? "Choose a card" : "Your card"}</h2>
          <p>Trust your intuition - select the one that calls to you.</p>
          <div className="seven-cards">
            {Array.from({ length: 7 }).map((_, index) => (
              <AnimatePresence key={index}>
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  animate={
                    selectedCard && index !== selectedSlot
                      ? { opacity: 0, scale: 0.92, y: 10 }
                      : { opacity: 1, scale: 1, y: 0 }
                  }
                  transition={{ duration: 0.45 }}
                  className="card-slot"
                >
                  {!selectedCard || index !== selectedSlot ? (
                    <CardBack onClick={() => onDraw(index)} disabled={!!selectedCard} />
                  ) : (
                    <motion.div
                      className="flip-shell"
                      initial={{ rotateY: 0, scale: 1 }}
                      animate={{ rotateY: 180, scale: 1.06 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <div className="flip-front"><CardBack onClick={() => undefined} disabled /></div>
                      <div className="flip-back">
                        {selectedCard && (
                          <img
                            src={selectedCard.image}
                            alt={selectedCard.name}
                            className={
                              orientation === "reversed" ? "flip-card-img card-img--reversed" : "flip-card-img"
                            }
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        </section>
      )}

      {selectedCard && (
        <section className="revealed">
          <CardFace card={selectedCard} orientation={orientation} />
          <button className="primary" onClick={onBegin}>
            Begin Reading →
          </button>
        </section>
      )}
    </motion.main>
  );
};
