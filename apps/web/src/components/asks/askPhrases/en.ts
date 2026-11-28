import type { AskPhrases } from "./types";

export const en = {
  bounded: true,
  phrases: [
    "let me know",
    "ready for your review",
    "ready for a review",
    "ready for review",
    "want me to",
    "should i",
    "shall i",
    "would you like",
    "your call",
  ],
} as const satisfies AskPhrases;
