import type { AskPhrases } from "./types";

export const ko = {
  bounded: false,
  phrases: [
    "알려 주세요",
    "알려주세요",
    "확인해 주세요",
    "확인해주세요",
    "검토해 주세요",
    "검토해주세요",
    "말씀해 주세요",
    "말씀해주세요",
    "원하시면",
    "원하신다면",
    "할까요",
    "드릴까요",
    "어떨까요",
  ],
} as const satisfies AskPhrases;
