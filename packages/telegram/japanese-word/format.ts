import { JpWordObject } from "./type";

export const formatToMarkdown = (words: JpWordObject[]): string => {
  return words
    .map((item, index) => {
      if (item.kanji) {
        return `${index + 1}. ${item.kanji}(${item.kana}): ${item.meaning}`;
      }
      return `${index + 1}. ${item.kana}: ${item.meaning}`;
    })
    .join("\n");
};
