import { motion } from "framer-motion";
import { MODES } from "../constants";
import type { ModeId } from "../types";

interface ModeSelectProps {
  selectedMode: ModeId | null;
  onSelect: (mode: ModeId) => void;
  onContinue: () => void;
}

export const ModeSelect = ({ selectedMode, onSelect, onContinue }: ModeSelectProps) => (
  <motion.main className="page mode-select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <h1>Interpretive Friction</h1>
    <p>Choose your reading mode.</p>
    <section className="mode-grid">
      {(Object.keys(MODES) as ModeId[]).map((id) => {
        const mode = MODES[id];
        const active = selectedMode === id;
        return (
          <button
            key={id}
            className={`mode-card ${active ? "active" : ""}`}
            onClick={() => onSelect(id)}
            style={{ borderColor: active ? mode.color : "transparent" }}
          >
            <span>{mode.icon}</span>
            <h3>{mode.name}</h3>
            <strong style={{ color: mode.color }}>{mode.frictionLabel}</strong>
            <p>{mode.description}</p>
          </button>
        );
      })}
    </section>
    <button className="primary" disabled={!selectedMode} onClick={onContinue}>
      Continue →
    </button>
  </motion.main>
);
