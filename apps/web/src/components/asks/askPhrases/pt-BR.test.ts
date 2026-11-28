import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("Brazilian Portuguese hand-offs", () => {
  it.each([
    ["me avise", "Implementei o retry com backoff.\n\nMe avise se quiser ajustar os tempos."],
    ["pronto para revisão", "O PR está pronto para revisão."],
    ["me diz se", "Tudo implementado. Me diz se prefere outro nome para a coluna."],
    ["a decisão é sua", "Deixei duas opções no esquema. A decisão é sua."],
    ["fico no aguardo", "A correção está no ar. Fico no aguardo do seu feedback."],
    [
      "a question that is not the last sentence",
      "Terminei a migração. Quer que eu atualize a documentação também? Se não, encerro por aqui.",
    ],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    [
      "a plain report",
      "Corrigi o bug do cache e adicionei um teste. Todas as verificações passam.",
    ],
    [
      "a hand-off in an earlier paragraph",
      "Me avise se quiser que eu renomeie a coluna.\n\nDepois segui em frente e terminei a migração.",
    ],
    [
      "a phrase inside a longer word",
      "Atualizei o script, porque o pipeline requer que eu defina a variável NODE_ENV.",
    ],
    [
      "Spanish prose",
      "El servicio me avisa cuando el despliegue termina; quiero que el usuario decida.",
    ],
    ["French prose", "Je veux que le cache expire; le script me dit si c'est fait."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
