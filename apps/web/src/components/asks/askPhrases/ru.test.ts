import { describe, expect, it } from "vite-plus/test";

import { detectAsk } from "../askDetection.logic";

describe("Russian hand-off phrases", () => {
  it.each([
    ["дайте знать", "Я обновил конфигурацию.\n\nДайте знать, что вы думаете."],
    ["дай знать", "Миграция написана. Дай знать, если всё ок."],
    ["хотите, чтобы я", "Исправил ошибку.\n\nХотите, чтобы я добавил тест"],
    ["хочешь, чтобы я", "Готово. Хочешь, чтобы я заодно обновил документацию."],
    ["готово к проверке", "Все изменения внесены, готово к проверке."],
    ["на ваше усмотрение", "Оба варианта работают, выбор на ваше усмотрение."],
    ["на твое усмотрение (е вместо ё)", "Названия оставил как есть, остальное на твое усмотрение."],
  ])("infers an ask from %s", (_label, text) => {
    expect(detectAsk(text)?.kind).toBe("inferred");
  });

  it.each([
    ["a plain report", "Исправил ошибку и добавил тест. Все проверки проходят."],
    [
      "a hand-off phrase in an earlier paragraph",
      "Дайте знать, если что-то непонятно.\n\nПосле этого я закончил работу и обновил документацию.",
    ],
    [
      "a phrase inside a longer word",
      "Хотите, чтобы яблоко созрело, подождите. Миграция завершена.",
    ],
    ["German text", "Die Änderung ist fertig und alle Tests laufen durch."],
  ])("does not infer an ask from %s", (_label, text) => {
    expect(detectAsk(text)).toBeNull();
  });
});
