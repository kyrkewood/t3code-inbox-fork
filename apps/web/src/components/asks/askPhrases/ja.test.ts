import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("Japanese hand-offs", () => {
  it.each([
    ["a confirmation request", "実装が完了しました。\n\nご確認ください。"],
    ["a review request", "PRを作成しました。レビューをお願いします。"],
    ["an invitation to reply", "修正しました。\n\n問題があればお知らせください"],
    ["an open design question", "二つの案があります。いかがでしょうか。"],
    ["an offer", "ご希望であれば、ドキュメントも更新します。"],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    ["a plain report", "バグを修正し、テストを追加しました。すべてのチェックが通っています。"],
    [
      "a hand-off that is not in the closing paragraph",
      "ご確認ください。\n\nその後、残りの作業も完了しました。",
    ],
    ["a word that contains a phrase fragment", "お知らせ機能を追加し、レビューを反映しました。"],
    ["Chinese status text sharing kanji", "已确认测试通过。請求耗时 20ms。"],
    ["Traditional Chinese status text sharing kanji", "已確認測試通過，沒有問題。"],
    ["Korean status text", "버그를 수정하고 테스트를 추가했습니다."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
