import type { ChatMessage, ModeId } from "../types";

/** Tunable per-mode sampling; adjust during experiments. */
const MODE_TEMPERATURES: Record<ModeId, number> = {
  oracle: 0.7,
  dialogue: 0.95,
  mirror: 0.4
};

interface LlmRequest {
  system: string;
  messages: ChatMessage[];
  mode: ModeId;
}

export const sendChatToLlm = async ({
  system,
  messages,
  mode
}: LlmRequest): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const model =
    (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ??
    "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in environment variables.");
  }

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  const temperature = MODE_TEMPERATURES[mode];

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }]
      },
      contents,
      generationConfig: {
        temperature
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "I wasn't able to generate a response. Please try again."
  );
};
