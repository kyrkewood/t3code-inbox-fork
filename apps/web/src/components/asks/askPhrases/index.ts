import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ja } from "./ja";
import { ko } from "./ko";
import { pt_BR } from "./pt-BR";
import { ru } from "./ru";
import { sv } from "./sv";
import type { AskPhrases } from "./types";
import { zh } from "./zh";

// Every language is tried on every message. Guessing the language of a short closing line is
// less reliable than the phrases are specific, so each table must only hold unambiguous hand-offs.
export const ASK_PHRASES: readonly AskPhrases[] = [en, de, sv, es, fr, pt_BR, ru, ja, zh, ko];
