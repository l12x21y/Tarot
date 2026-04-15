import type { ChatMessage, ModeId } from "../types";

/** Tunable per-mode sampling; adjust during experiments. */
const MODE_TEMPERATURES: Record<ModeId, number> = {
  oracle: 0.7,
  dialogue: 0.95,
  mirror: 0.4
};

type LlmProvider = "gemini" | "openai";

interface LlmRequest {
  system: string;
  messages: ChatMessage[];
  mode: ModeId;
}

const resolveProvider = (): LlmProvider => {
  const provider = import.meta.env.VITE_LLM_PROVIDER as string | undefined;
  return provider === "openai" || provider === "qwen" ? "openai" : "gemini";
};

const normalizeChatCompletionsEndpoint = (
  rawUrl: string,
  fallback: string
): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  return `${trimmed.replace(/\/+$/, "")}/chat/completions`;
};

const readTextFromOpenAiResponse = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;

  const root = data as Record<string, unknown>;
  const choices = root.choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;

  const firstChoice = choices[0] as Record<string, unknown> | undefined;
  const message = firstChoice?.message as Record<string, unknown> | undefined;
  const content = message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const item = part as Record<string, unknown>;
        return typeof item.text === "string" ? item.text : "";
      })
      .join("");
    return text.trim() ? text : null;
  }

  return null;
};

const sendChatToGemini = async ({
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

const sendChatToOpenAI = async ({
  system,
  messages,
  mode
}: LlmRequest): Promise<string> => {
  const requestedProvider = import.meta.env.VITE_LLM_PROVIDER as string | undefined;
  const isQwen = requestedProvider === "qwen";
  const apiKey = isQwen
    ? (import.meta.env.VITE_QWEN_API_KEY as string | undefined)
    : (import.meta.env.VITE_OPENAI_API_KEY as string | undefined);
  const model = isQwen
    ? ((import.meta.env.VITE_QWEN_MODEL as string | undefined) ?? "qwen-plus")
    : ((import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? "gpt-4o-mini");
  const endpoint = isQwen
    ? normalizeChatCompletionsEndpoint(
      (import.meta.env.VITE_QWEN_BASE_URL as string | undefined) ??
        "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    )
    : normalizeChatCompletionsEndpoint(
      (import.meta.env.VITE_OPENAI_BASE_URL as string | undefined) ??
        "https://api.openai.com/v1",
      "https://api.openai.com/v1/chat/completions"
    );
  if (!apiKey) {
    throw new Error(
      isQwen
        ? "Missing VITE_QWEN_API_KEY in environment variables."
        : "Missing VITE_OPENAI_API_KEY in environment variables."
    );
  }

  const temperature = MODE_TEMPERATURES[mode];
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        ...messages.map((msg) => ({ role: msg.role, content: msg.content }))
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as unknown;
  const text = readTextFromOpenAiResponse(data);
  return text ?? "I wasn't able to generate a response. Please try again.";
};

export const sendChatToLlm = async ({
  system,
  messages,
  mode
}: LlmRequest): Promise<string> => {
  const provider = resolveProvider();
  if (provider === "openai") {
    return sendChatToOpenAI({ system, messages, mode });
  }
  return sendChatToGemini({ system, messages, mode });
};
