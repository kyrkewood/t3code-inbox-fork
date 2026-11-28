import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("Korean hand-offs", () => {
  it.each([
    ["a confirmation request", "구현을 마쳤습니다.\n\n확인해 주세요."],
    ["a review request", "PR을 만들었습니다. 검토해주세요."],
    ["an invitation to reply", "수정했습니다. 문제가 있으면 알려 주세요"],
    ["a conditional offer", "원하시면 문서도 함께 업데이트하겠습니다."],
    ["an unpunctuated question", "다음으로 어떻게 할까요"],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    ["a plain report", "버그를 수정하고 테스트를 추가했습니다. 모든 검사가 통과했습니다."],
    [
      "a hand-off that is not in the closing paragraph",
      "확인해 주세요.\n\n이후 나머지 작업도 마쳤습니다.",
    ],
    ["a word that contains a phrase fragment", "알려진 문제를 수정하고 설정을 확인했습니다."],
    ["Japanese status text", "バグを修正し、テストを確認しました。"],
    ["Chinese status text", "已确认测试通过，没有问题。"],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
