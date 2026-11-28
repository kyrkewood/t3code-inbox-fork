import type { AskPhrases } from "./types";

export const ja = {
  bounded: false,
  phrases: [
    "ご確認くださ",
    "ご確認をお願い",
    "確認してください",
    "レビューをお願い",
    "お知らせくださ",
    "教えてください",
    "いかがでしょうか",
    "よろしいでしょうか",
    "どうしますか",
    "ご指示くださ",
    "ご判断くださ",
    "ご希望であれば",
    "ご希望でしたら",
    "よろしければ",
  ],
} as const satisfies AskPhrases;
