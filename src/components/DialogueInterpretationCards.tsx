import { useState } from "react";
import type { DialogueStructuredFirstPayload } from "../types";

interface DialogueInterpretationCardsProps {
  data: DialogueStructuredFirstPayload;
  accentColor: string;
}

export const DialogueInterpretationCards = ({
  data,
  accentColor
}: DialogueInterpretationCardsProps) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="dialogue-interpretation-block">
      <div className="dialogue-interpretation-grid">
        {data.interpretations.map((item, index) => (
          <div
            key={`${item.lens}-${index}`}
            className="dialogue-lens-card"
            style={{ borderColor: accentColor }}
          >
            <h4 className="dialogue-lens-title" style={{ color: accentColor }}>
              {item.lens}
            </h4>
            <p className="dialogue-lens-summary">{item.summary}</p>
            <button
              type="button"
              className="dialogue-read-full"
              onClick={() => toggle(index)}
            >
              {expanded[index]
                ? "Hide full interpretation"
                : "Read full interpretation →"}
            </button>
            {expanded[index] ? (
              <div className="dialogue-lens-full">
                <p className="dialogue-lens-full-text">{item.full}</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
