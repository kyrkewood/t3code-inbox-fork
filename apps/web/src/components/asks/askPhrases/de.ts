import type { AskPhrases } from "./types";

export const de = {
  bounded: true,
  phrases: [
    "sag mir bescheid",
    "sag bescheid",
    "gib mir bescheid",
    "lass es mich wissen",
    "lass mich wissen",
    "sagen sie mir bescheid",
    "sagen sie bescheid",
    "lassen sie mich wissen",
    "soll ich",
    "möchtest du",
    "möchten sie",
    "willst du",
    "wenn du möchtest",
    "wenn du willst",
    "wenn sie möchten",
    "bereit zur prüfung",
    "bereit zum review",
    "bereit für dein review",
    "bereit für deine prüfung",
  ],
} as const satisfies AskPhrases;
