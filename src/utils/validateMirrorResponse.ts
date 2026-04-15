export interface MirrorValidationResult {
  valid: boolean;
  issues: string[];
}

/** Allowed non-question acknowledgments (normalized, no trailing punctuation). */
const MIRROR_ACK_WHITELIST = new Set([
  "that's an interesting connection",
  "that's really interesting",
  "that's an interesting shift",
  "i see",
  "i hear you",
  "thank you for sharing that",
  "thanks for sharing",
  "thanks for sharing that",
  "i hadn't thought of it that way",
  "i hadn't considered that angle",
  "i appreciate you saying that",
  "i appreciate you sharing that",
  "go on",
  "right",
  "okay",
  "ok",
  "mm",
  "mm-hmm",
  "mm hmm",
  "i understand",
  "wow",
  "hmm",
  "i see what you mean",
  "thank you",
  "thanks",
  "i'd love to explore this card through your eyes",
  "i'd love to explore this through your eyes"
]);

const normalizePhrase = (s: string): string =>
  s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?,;:…]+$/u, "")
    .toLowerCase();

const splitIntoSentences = (text: string): string[] => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

const FRAME_CHECKS: Array<{ re: RegExp; issue: string }> = [
  {
    re: /telling you to/i,
    issue: 'Possible embedded frame: phrase like "telling you to..."'
  },
  {
    re: /suggesting that/i,
    issue: 'Possible embedded frame: phrase like "suggesting that..."'
  },
  { re: /means that/i, issue: 'Possible embedded frame: phrase like "means that..."' },
  { re: /\brepresents\b/i, issue: 'Possible embedded frame: word "represents"' },
  { re: /\bsymbolizes\b/i, issue: 'Possible embedded frame: word "symbolizes"' },
  { re: /\bindicates\b/i, issue: 'Possible embedded frame: word "indicates"' },
  {
    re: /\ba new beginning\b/i,
    issue: 'Possible embedded frame: phrase "a new beginning"'
  },
  { re: /\bletting go\b/i, issue: 'Possible embedded frame: phrase "letting go"' },
  {
    re: /\btransformation\b/i,
    issue: 'Possible embedded frame: word "transformation"'
  },
  { re: /\bmoving on\b/i, issue: 'Possible embedded frame: phrase "moving on"' },
  { re: /\bholding on\b/i, issue: 'Possible embedded frame: phrase "holding on"' },
  {
    re: /this card is about/i,
    issue: 'Possible embedded frame: phrase like "this card is about..."'
  },
  {
    re: /the message here is/i,
    issue: 'Possible embedded frame: phrase like "the message here is..."'
  }
];

const countQuestionMarks = (text: string): number =>
  (text.match(/\?/g) ?? []).length;

/**
 * Post-processing checks for Mirror Mode assistant text before showing the user.
 */
export const validateMirrorResponse = (text: string): MirrorValidationResult => {
  const issues: string[] = [];

  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: false, issues: ["Empty response"] };
  }

  const sentences = splitIntoSentences(trimmed);
  const chunks = sentences.length > 0 ? sentences : [trimmed];

  for (const sentence of chunks) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.endsWith("?")) continue;
    const norm = normalizePhrase(s);
    if (!norm) continue;
    const words = norm.split(/\s+/).filter(Boolean);
    if (words.length >= 8) {
      issues.push(
        `Non-question statement or unapproved phrase (${words.length} words, max 7 for acknowledgments): "${s.slice(0, 100)}${s.length > 100 ? "…" : ""}"`
      );
      continue;
    }
    if (!MIRROR_ACK_WHITELIST.has(norm)) {
      issues.push(
        `Non-question sentence not on acknowledgment whitelist: "${s.slice(0, 120)}${s.length > 120 ? "…" : ""}"`
      );
    }
  }

  for (const { re, issue } of FRAME_CHECKS) {
    if (re.test(trimmed)) {
      issues.push(issue);
    }
  }

  const qCount = countQuestionMarks(trimmed);
  if (qCount > 2) {
    issues.push(
      `Multiple questions: ${qCount} question marks (Mirror Mode allows at most 2, e.g. brief acknowledgment plus one question)`
    );
  }

  const unique = [...new Set(issues)];
  return { valid: unique.length === 0, issues: unique };
};

