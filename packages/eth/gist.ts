import axios from "axios";
import moment, { Moment } from "moment";

export interface GistFile {
  "eth-miner-log.json": { content: string };
  "summary.md": { content: string };
  "yyy-paid-logs.json": { content: string};
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

interface PaidLog {
  time: string;
}

export const getLastPaid = async (): Promise<Moment> => {
  const files = await getGist();
  const logs = JSON.parse(files['yyy-paid-logs.json'].content) as PaidLog[];
  if (!logs || !logs[0]) {
    throw new Error('paid logs not found');
  }
  return moment(logs[0].time);
}
