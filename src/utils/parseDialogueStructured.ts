import type { DialogueStructuredFirstPayload } from "../types";

const stripJsonFences = (raw: string): string => {
  const t = raw.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1].trim() : t;
};

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const tryParseJson = (text: string): unknown | null => {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
};

export const parseDialogueStructuredResponse = (
  raw: string
): DialogueStructuredFirstPayload | null => {
  const parsed = tryParseJson(stripJsonFences(raw));
  if (parsed === null) return null;

  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const interpretations = obj.interpretations;
  const invitation = obj.invitation;

  if (!Array.isArray(interpretations) || interpretations.length < 2 || interpretations.length > 3) {
    return null;
  }
  if (!isNonEmptyString(invitation)) return null;

  const cards: DialogueStructuredFirstPayload["interpretations"] = [];
  for (const item of interpretations) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    if (
      !isNonEmptyString(row.lens) ||
      !isNonEmptyString(row.summary) ||
      !isNonEmptyString(row.full)
    ) {
      return null;
    }
    cards.push({
      lens: row.lens.trim(),
      summary: row.summary.trim(),
      full: row.full.trim()
    });
  }

  return { interpretations: cards, invitation: invitation.trim() };
};
