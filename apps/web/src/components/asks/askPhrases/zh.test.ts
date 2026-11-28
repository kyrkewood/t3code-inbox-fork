import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("Chinese hand-offs", () => {
  it.each([
    ["a confirmation request", "实现已完成。\n\n请确认。"],
    ["a request to reply", "已修复该问题，如有疑问请告诉我"],
    ["a review request", "PR 已创建，请审阅。"],
    ["an offer", "我可以顺便更新文档，要不要我一起做。"],
    ["a Traditional Chinese request", "實作已完成，請確認。"],
    ["an open opinion", "有两种方案，你觉得呢"],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    ["a plain report", "已修复该问题并添加了测试，所有检查均已通过。"],
    ["a hand-off that is not in the closing paragraph", "请确认。\n\n随后我完成了其余工作。"],
    [
      "a word that contains a phrase fragment",
      "我已审阅并确认了所有改动，检查了是否需要更新缓存。",
    ],
    ["Japanese status text sharing kanji", "テストを確認しました。変更を反映済みです。"],
    ["kanji-heavy Japanese status text", "設定を確認済みです。"],
    ["Korean status text", "버그를 수정하고 테스트를 추가했습니다."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
