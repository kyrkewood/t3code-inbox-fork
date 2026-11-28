import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("Spanish hand-offs", () => {
  it.each([
    [
      "avísame",
      "Implementé el reintento con backoff.\n\nAvísame si quieres que ajuste los tiempos.",
    ],
    ["avíseme (usted)", "El PR está abierto. Avíseme si desea otro enfoque."],
    ["listo para revisión", "Los cambios están listos para tu revisión."],
    ["dime si", "Terminé la migración. Dime si prefieres otro nombre para la columna."],
    ["tú decides", "Dejé dos opciones para el esquema. Tú decides cuál usamos."],
    [
      "a question that is not the last sentence",
      "Todo implementado. ¿Quieres que también actualice los docs? Si no, cierro aquí.",
    ],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    [
      "a plain report",
      "Corregí el error de caché y añadí una prueba. Todas las comprobaciones pasan.",
    ],
    [
      "a hand-off in an earlier paragraph",
      "Avísame si quieres que cambie el nombre.\n\nDespués seguí adelante y terminé la migración.",
    ],
    ["a phrase inside a longer word", "Renombré la variable `preavisame` a `notificar`."],
    [
      "Portuguese prose",
      "Corrigi o bug. O servidor me avisa quando o deploy termina e quer que o token expire.",
    ],
    ["French prose", "Le script me dit si tu décides de relancer le build."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
