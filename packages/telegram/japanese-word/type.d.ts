export interface JpWordObject {
  kana: string;
  kanji?: string;
  meaning: string;
  meta: {
    id: string;
    createdAt: string;
  };
}

export interface GistFile {
  [key: string]: { content: string };
}
