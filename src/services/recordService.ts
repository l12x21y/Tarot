import type { CardOrientation, ModeId, TarotCard } from "../types";

type MessageRole = "user" | "assistant";

type BaseSessionContext = {
  sessionId: string;
  mode: ModeId;
  card: TarotCard;
  orientation: CardOrientation;
  inquiry: string;
  preAppraisal: string;
};

type SessionEventPayload =
  | {
      type: "session-start";
      ts: number;
      message: { role: MessageRole; content: string };
    }
  | {
      type: "user-message";
      ts: number;
      message: { role: MessageRole; content: string };
    }
  | {
      type: "assistant-message";
      ts: number;
      message: { role: MessageRole; content: string };
    }
  | {
      type: "reflection";
      ts: number;
      reflection: string;
      conversationLog: Array<{
        role: MessageRole;
        content: string;
        ts: number;
      }>;
    };

export type SessionRecordEvent = BaseSessionContext & SessionEventPayload;

const RECORDING_BASE_URL =
  (import.meta.env.VITE_RECORDING_API_BASE_URL as string | undefined) ?? "/api";

let warnedAboutNetlifyApiConfig = false;

const warnIfLikelyMisconfiguredInNetlify = () => {
  if (warnedAboutNetlifyApiConfig) return;
  if (typeof window === "undefined") return;
  const host = window.location.hostname.toLowerCase();
  if (!host.endsWith(".netlify.app")) return;
  if (RECORDING_BASE_URL !== "/api") return;

  warnedAboutNetlifyApiConfig = true;
  console.error(
    "[recordSessionEvent] Netlify deployment is using VITE_RECORDING_API_BASE_URL=/api, but this site has no built-in backend. Set VITE_RECORDING_API_BASE_URL to your deployed backend URL, e.g. https://<your-backend-domain>/api, then redeploy Netlify."
  );
};

export const recordSessionEvent = async (
  event: SessionRecordEvent
): Promise<void> => {
  if (typeof fetch !== "function") return;
  warnIfLikelyMisconfiguredInNetlify();

  try {
    const response = await fetch(`${RECORDING_BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Recording backend failed: ${response.status} ${text}`);
    }
  } catch (error) {
    console.warn("[recordSessionEvent] failed to persist event", error);
  }
};