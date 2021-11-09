import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { insert } from "../japanese-word";

interface TG_UPDATE {
  update_id: number;
  message: {
    message_id: number;
    chat: {
      username: string;
    };
    text: string;
  };
}

export default async (request: VercelRequest, response: VercelResponse) => {
  const { message } = request.body as TG_UPDATE;
  if (message.chat.username !== "wangsijie") {
    response.status(401).end();
    return;
  }

  if (!message.text) {
    response.status(400).end();
    return;
  }

  const [title, content, meaning, kanji] = message.text.split("\n");

  try {
    if (title === "jp") {
      await insert(content, meaning, kanji);
    } else {
      await axios.post(
        "https://api.github.com/repos/wangsijie/note/issues",
        { title, body: content },
        {
          headers: {
            accept: "application/vnd.github.v3+json",
            authorization: `bearer ${process.env.GITHUB_TOKEN}`,
          },
        }
      );
    }
  } catch (e) {
    console.error(e);
  }

  response.status(200).end();
};
