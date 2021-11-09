import axios from "axios";
import { GistFile } from "./type";

export const getGist = async (): Promise<GistFile> => {
  if (!process.env.JP_GIST) {
    throw new Error("JP_GIST is empty");
  }
  const { data } = await axios.get(
    `https://api.github.com/gists/${process.env.JP_GIST}`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );
  return data.files;
};

export const updateGist = async (files: GistFile) => {
  if (!process.env.JP_GIST) {
    throw new Error("JP_GIST is empty");
  }
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is empty");
  }
  await axios.patch(
    `https://api.github.com/gists/${process.env.JP_GIST}`,
    { files },
    {
      headers: {
        accept: "application/vnd.github.v3+json",
        authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
};
