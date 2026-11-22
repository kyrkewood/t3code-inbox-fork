/**
 * Finds an ask in the final assistant message when the agent raised none through the app.
 * Two tiers: an explicit `Needs you:` line is trusted; a closing question or review hand-off is
 * only inferred and the UI says so. Wrong inferences cost trust, so the inferred tier stays narrow.
 */

export type DetectedAsk =
  | { readonly kind: "marked"; readonly summary: string }
  | { readonly kind: "inferred"; readonly summary: string };

const MARKER = /^\s*(?:[-*>]\s+)?(?:\*\*|__)?needs you(?:\*\*|__)?:(?:\*\*|__)?\s*(.*)$/i;
const FENCE = /^\s*(?:```|~~~)/;
const INFERRED_PHRASE =
  /\b(?:let me know|ready for (?:your |a )?review|want me to|should i|shall i|would you like|your call)\b/i;
const SUMMARY_MAX_CHARS = 160;

interface Line {
  readonly text: string;
  readonly code: boolean;
}

function toLines(text: string): Line[] {
  let inFence = false;
  return text.split(/\r?\n/).map((raw) => {
    if (FENCE.test(raw)) {
      inFence = !inFence;
      return { text: raw, code: true };
    }
    return { text: raw, code: inFence };
  });
}

/** The last non-empty line and everything before it, or null when the message ends in code. */
function proseLines(text: string): Line[] | null {
  const lines = toLines(text);
  let end = lines.length;
  while (end > 0 && lines[end - 1]!.text.trim() === "") end -= 1;
  if (end === 0 || lines[end - 1]!.code) return null;
  return lines.slice(0, end);
}

/** Marker lines only count as one block at the very end, so a mid-message mention is ignored. */
export function extractNeedsYouLines(text: string): string[] {
  const lines = proseLines(text);
  if (lines === null) return [];
  const asks: string[] = [];
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]!;
    const match = line.code ? null : MARKER.exec(line.text);
    if (match === null) break;
    const ask = match[1]!.trim();
    if (ask.length === 0) return [];
    asks.unshift(ask);
  }
  return asks;
}

function clip(text: string): string {
  return text.length > SUMMARY_MAX_CHARS ? `${text.slice(0, SUMMARY_MAX_CHARS - 1)}…` : text;
}

function inferAsk(text: string): string | null {
  const lines = proseLines(text);
  if (lines === null) return null;
  const last = lines[lines.length - 1]!.text.trim();
  // Only the closing paragraph counts: a question asked earlier was usually answered since.
  let start = lines.length - 1;
  while (start > 0 && lines[start - 1]!.text.trim() !== "" && !lines[start - 1]!.code) start -= 1;
  const closing = lines
    .slice(start)
    .map((line) => line.text.trim())
    .join(" ");
  const plain = last.replace(/[*_`>\s]+$/g, "");
  if (plain.endsWith("?") || INFERRED_PHRASE.test(closing)) return clip(plain);
  return null;
}

export function detectAsk(text: string): DetectedAsk | null {
  const marked = extractNeedsYouLines(text);
  if (marked.length > 0) return { kind: "marked", summary: clip(marked.join(" · ")) };
  const summary = inferAsk(text);
  return summary === null ? null : { kind: "inferred", summary };
}
