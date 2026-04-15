export type ModeId = "oracle" | "dialogue" | "mirror";

export interface ModeConfig {
  id: ModeId;
  name: string;
  roleLabel: string;
  shortLabel: string;
  frictionLabel: string;
  icon: string;
  color: string;
  description: string;
  hint: string;
  initialTrigger: string;
  inputPlaceholder: string;
}

export type CardOrientation = "upright" | "reversed";

export interface TarotCard {
  id: number;
  name: string;
  number: string;
  meaning: string;
  reversedMeaning: string;
  image: string;
  imagery: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** First Dialogue Mode assistant turn: JSON payload rendered as interpretation cards. */
export interface DialogueStructuredFirstPayload {
  interpretations: Array<{
    lens: string;
    summary: string;
    full: string;
  }>;
  invitation: string;
}

/** Messages shown in the Reading chat (API history stays plain ChatMessage[]). */
export type ReadingThreadMessage =
  | ChatMessage
  | {
      role: "assistant";
      dialogueStructured: DialogueStructuredFirstPayload;
    };
