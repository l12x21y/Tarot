import { motion } from "framer-motion";

interface CardBackProps {
  disabled?: boolean;
  onClick: () => void;
}

export const CardBack = ({ disabled, onClick }: CardBackProps) => (
  <motion.button
    className="card-back"
    whileHover={disabled ? {} : { y: -12, scale: 1.05, boxShadow: "0 0 24px rgba(200,149,108,0.35)" }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
  >
    <span>✦</span>
  </motion.button>
);
