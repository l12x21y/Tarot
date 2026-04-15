import { useState } from "react";

interface ChatInputProps {
  color: string;
  disabled?: boolean;
  placeholder: string;
  onSend: (value: string) => Promise<void> | void;
}

export const ChatInput = ({ color, disabled, placeholder, onSend }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const submit = async () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    await onSend(text);
  };

  return (
    <div className="chat-input">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
        }}
      />
      <button
        type="button"
        onClick={() => void submit()}
        disabled={disabled || !value.trim()}
        style={{ backgroundColor: color }}
      >
        Send
      </button>
    </div>
  );
};
