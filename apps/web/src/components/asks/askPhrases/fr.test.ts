import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("French hand-offs", () => {
  it.each([
    [
      "dis-moi",
      "J'ai ajouté la logique de nouvelle tentative.\n\nDis-moi si tu veux que j'ajuste les délais.",
    ],
    ["faites-moi savoir", "La modification est en place. Faites-moi savoir si ça convient."],
    ["prêt pour relecture", "La PR est ouverte et prête pour relecture."],
    ["à vous de décider", "Deux options pour le schéma. À vous de décider."],
    [
      "tenez-moi au courant",
      "Le correctif est déployé. Tenez-moi au courant de ce que vous décidez.",
    ],
    [
      "a question that is not the last sentence",
      "Tout est en place. Souhaitez-vous que je mette aussi la documentation à jour ? Sinon je m'arrête là.",
    ],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    [
      "a plain report",
      "J'ai corrigé le bug du cache et ajouté un test. Toutes les vérifications passent.",
    ],
    [
      "a hand-off in an earlier paragraph",
      "Dis-moi si tu veux que je renomme la colonne.\n\nEnsuite j'ai terminé la migration.",
    ],
    ["a phrase inside a longer word", "J'ai renommé `redites-moi` en `replay`."],
    ["Portuguese prose", "Corrigi o bug. O servidor me diz quando o deploy termina."],
    ["Spanish prose", "Corregí el error de caché. El servicio me dice si quiere que se reintente."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
