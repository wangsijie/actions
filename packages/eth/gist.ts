import axios from "axios";

export interface GistFile {
  "eth-miner-log.json": { content: string };
  "summary.md": { content: string };
}

export const getGist = async (): Promise<GistFile> => {
  if (!process.env.GIST_KEY) {
    throw new Error("GIST_KEY is empty");
  }
  const { data } = await axios.get<{ files: GistFile }>(
    `https://api.github.com/gists/${process.env.GIST_KEY}`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );
  return data.files;
};

export const updateGist = async (files: Partial<GistFile>) => {
  if (!process.env.GIST_KEY) {
    throw new Error("GIST_KEY is empty");
  }
  if (!process.env.GIST_TOKEN) {
    throw new Error("GIST_TOKEN is empty");
  }
  await axios.patch(
    `https://api.github.com/gists/${process.env.GIST_KEY}`,
    { files },
    {
      headers: {
        accept: "application/vnd.github.v3+json",
        authorization: `bearer ${process.env.GIST_TOKEN}`,
      },
    }
  );
};

export interface MinerLog {
  name: "wsj" | "yyy";
  date: string;
  eth: number;
  ethPrice: number;
  rmb: number;
  rate: number;
}

export const getMinerLogs = async (): Promise<MinerLog[]> => {
  const files = await getGist();
  return JSON.parse(files["eth-miner-log.json"].content);
};

export const updateMinerLogs = async (logs: MinerLog[]) => {
  await updateGist({ "eth-miner-log.json": { content: JSON.stringify(logs) } });
};
