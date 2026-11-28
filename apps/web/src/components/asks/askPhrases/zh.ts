import type { AskPhrases } from "./types";

export const zh = {
  bounded: false,
  phrases: [
    "请确认",
    "請確認",
    "请告诉我",
    "請告訴我",
    "请告知",
    "請告知",
    "请审阅",
    "請審閱",
    "请查看并",
    "是否需要我来",
    "要不要我",
    "你觉得呢",
    "您觉得呢",
  ],
} as const satisfies AskPhrases;
