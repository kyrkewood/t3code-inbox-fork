import type { AskPhrases } from "./types";

// Question forms keep the opening `¿` so a rhetorical "quiere que" in a report does not match.
export const es = {
  bounded: true,
  phrases: [
    "avísame",
    "avisame",
    "avíseme",
    "dime si",
    "dime qué",
    "házmelo saber",
    "hazme saber",
    "hágamelo saber",
    "déjame saber",
    "¿quieres que",
    "¿quiere que",
    "si quieres que",
    "listo para revisión",
    "lista para revisión",
    "listo para su revisión",
    "lista para su revisión",
    "para tu revisión",
    "tú decides",
    "quedo atento",
    "quedo a la espera",
  ],
} as const satisfies AskPhrases;
