import { describe, expect, it } from "vite-plus/test";

import { detectAsk, extractNeedsYouLines } from "./askDetection.logic";

describe("extractNeedsYouLines", () => {
  it("reads trailing marker lines in order", () => {
    const text = "Done.\n\nNeeds you: merge #12?\nNeeds you: pick A or B for the retry policy";
    expect(extractNeedsYouLines(text)).toEqual(["merge #12?", "pick A or B for the retry policy"]);
  });

  it("accepts bold, bullet and case variants", () => {
    expect(extractNeedsYouLines("Ok\n\n**Needs you:** review PR #3")).toEqual(["review PR #3"]);
    expect(extractNeedsYouLines("Ok\n\n- needs you: approve the rename")).toEqual([
      "approve the rename",
    ]);
  });

  it("ignores a marker that is not at the end of the message", () => {
    expect(
      extractNeedsYouLines("Needs you: merge #12?\n\nThen I carried on and finished."),
    ).toEqual([]);
  });

  it("ignores a marker inside a code fence", () => {
    expect(extractNeedsYouLines("Use this format:\n```\nNeeds you: <ask>\n```")).toEqual([]);
  });

  it("ignores an empty marker", () => {
    expect(extractNeedsYouLines("Done.\n\nNeeds you:")).toEqual([]);
  });
});

describe("detectAsk", () => {
  it("marks a message with a Needs you line", () => {
    expect(detectAsk("All green.\n\nNeeds you: merge #12?")).toEqual({
      kind: "marked",
      summary: "merge #12?",
    });
  });

  it("joins several asks into one summary", () => {
    expect(detectAsk("x\n\nNeeds you: merge #1?\nNeeds you: pick A or B")).toEqual({
      kind: "marked",
      summary: "merge #1? · pick A or B",
    });
  });

  it.each([
    ["a closing question", "I changed the retry logic.\n\nShould I also update the docs?"],
    ["an invitation to review", "The PR is up.\n\nLet me know what you think."],
    ["a review hand-off", "Everything is implemented and ready for your review."],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    ["a plain report", "Fixed the bug and added a test. All checks pass."],
    ["a question mid-message that was answered", "Why did it fail? The cache was stale.\n\nFixed."],
    ["a question inside a code block", "Run:\n```\nwhat is this?\n```\nDone."],
    ["an empty message", "   "],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
