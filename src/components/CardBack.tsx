import { motion } from "framer-motion";

interface CardBackProps {
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export const CardBack = ({ disabled, onClick, className }: CardBackProps) => (
  <motion.button
    className={className ? `card-back ${className}` : "card-back"}
    whileHover={
      disabled
        ? {}
        : {
            scale: 1.03,
            boxShadow: "0 0 18px rgba(200,149,108,0.32)",
            filter: "brightness(1.06)"
          }
    }
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    transition={{ duration: 0.16, ease: "easeOut" }}
  >
    <span>✦</span>
  </motion.button>
);
