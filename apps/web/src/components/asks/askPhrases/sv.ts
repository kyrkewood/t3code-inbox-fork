import type { AskPhrases } from "./types";

export const sv = {
  bounded: true,
  phrases: [
    "säg till om",
    "säg till när",
    "säg till så",
    "låt mig veta",
    "hör av dig",
    "hör av er",
    "ge mig besked",
    "meddela mig",
    "vill du att jag",
    "vill ni att jag",
    "vill du att vi",
    "redo för granskning",
    "redo för din granskning",
    "redo för review",
    "redo för din review",
    "klar för granskning",
    "upp till dig",
    "upp till er",
  ],
} as const satisfies AskPhrases;
