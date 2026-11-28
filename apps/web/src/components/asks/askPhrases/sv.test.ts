import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("Swedish hand-off phrases", () => {
  it.each([
    ["Säg till om", "Jag har rättat cachen.\n\nSäg till om något ser fel ut."],
    ["Låt mig veta", "Migreringen är klar.\n\nLåt mig veta vad du tycker."],
    [
      "Vill du att jag",
      "Ändringen är på plats.\n\nVill du att jag uppdaterar dokumentationen också? Säg bara.",
    ],
    ["Hör av dig", "Allt är implementerat. Hör av dig när du har testat."],
    ["upp till dig", "Båda lösningarna fungerar. Det är upp till dig vilken vi väljer."],
    ["redo för granskning", "Grenen är pushad och redo för granskning."],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    ["a plain report", "Jag har lagt till testet och alla kontroller går igenom."],
    [
      "a hand-off in an earlier paragraph",
      "Låt mig veta vad du tycker om planen.\n\nJag har nu uppdaterat testerna och allt går igenom.",
    ],
    ["a phrase inside a longer word", "Det finns inga öppna ärenden redo för granskningar."],
    ["an English report", "I fixed the bug and the checks pass. The branch is pushed."],
    ["a German report", "Ich habe den Fehler behoben und die Tests laufen durch."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
