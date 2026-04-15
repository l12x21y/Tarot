import { motion } from "framer-motion";
import type { ChatMessage as ChatMessageType, ModeConfig } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  mode: ModeConfig;
}

export const ChatMessage = ({ message, mode }: ChatMessageProps) => {
  const assistant = message.role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message ${assistant ? "assistant" : "user"}`}
      style={assistant ? { borderColor: mode.color } : undefined}
    >
      {assistant && <small style={{ color: mode.color }}>{mode.roleLabel}</small>}
      <p>{message.content}</p>
    </motion.div>
  );
};
