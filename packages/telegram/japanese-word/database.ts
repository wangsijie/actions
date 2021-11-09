import UUID from "readableuuid";
import { formatToMarkdown } from "./format";
import { getGist, updateGist } from "./gist";
import { JpWordObject } from "./type";

export const init = async (): Promise<JpWordObject[]> => {
  const files = await getGist();
  if (!files["japanese-words.json"]) {
    throw new Error("japanese-words.json is missing");
  }
  return JSON.parse(files["japanese-words.json"].content);
};

export const insert = async (
  kana: string,
  meaning: string,
  kanji?: string
): Promise<{ insertedId: string }> => {
  const words = await init();
  const id = UUID();
  words.push({
    kana,
    meaning,
    kanji,
    meta: {
      id,
      createdAt: new Date().toISOString(),
    },
  });
  await updateGist({
    "japanese-words.json": { content: JSON.stringify(words) },
    "japanese-words.md": { content: formatToMarkdown(words) },
  });
  return { insertedId: id };
};
