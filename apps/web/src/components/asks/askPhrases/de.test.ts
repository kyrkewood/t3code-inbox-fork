import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("German hand-off phrases", () => {
  it.each([
    [
      "Sag mir Bescheid",
      "Ich habe den Cache repariert.\n\nSag mir Bescheid, wenn es bei dir läuft.",
    ],
    ["Lass mich wissen", "Die Migration ist fertig.\n\nLass mich wissen, ob das so passt."],
    [
      "Soll ich",
      "Der Fix ist drin.\n\nSoll ich auch die Doku anpassen? Dann mache ich das gleich.",
    ],
    ["Wenn du möchtest", "Alles umgesetzt. Wenn du möchtest, schreibe ich noch einen Test dazu."],
    ["formal Sie", "Die Änderung ist eingespielt.\n\nSagen Sie mir Bescheid, falls etwas fehlt."],
    ["bereit zur Prüfung", "Der Branch ist gepusht und bereit zur Prüfung."],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    ["a plain report", "Ich habe den Fehler behoben und die Tests laufen durch."],
    [
      "a hand-off in an earlier paragraph",
      "Sag mir Bescheid, was du davon hältst.\n\nDanach habe ich die Tests angepasst und alles läuft durch.",
    ],
    ["a phrase inside a longer word", "Die Testdatenbank ist bereit zur Prüfungsumgebung."],
    ["an English report", "I fixed the bug and the checks pass. The branch is pushed."],
    ["a Swedish report", "Jag har lagt till testet och alla kontroller går igenom."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
