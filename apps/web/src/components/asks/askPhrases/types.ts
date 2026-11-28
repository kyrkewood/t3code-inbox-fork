/**
 * Closing-paragraph phrases that suggest an agent is handing a decision back, for one language.
 * `bounded` languages put spaces between words, so a phrase must not match inside a longer word.
 * Unbounded ones (Japanese, Chinese, Korean) have no such boundary, so phrases match anywhere.
 */
export interface AskPhrases {
  readonly bounded: boolean;
  readonly phrases: readonly string[];
}
