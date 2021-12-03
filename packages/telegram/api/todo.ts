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

const getTypeAndLines = (body: string): ['todo' | 'jp', string[]] => {
  const lines = body.split('\n');
  const [remark, ...rest] = lines;
  if (remark === 'todo') {
    return ['todo', rest];
  }

  if (remark === 'jp') {
    return ['jp', rest];
  }

  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(body)) {
    return ['jp', lines];
  }

  return ['todo', lines];
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

  const [type, lines] = getTypeAndLines(message.text);
  
  try {
    if (type === "jp") {
      if (lines.length > 2) {
        const [kanji, kana, meaning] = lines;
        await insert(kana, meaning, kanji);
      } else {
        const [kana, meaning] = lines;
        await insert(kana, meaning);
      }
    } else {
      const [title, ...content] = lines;
      await axios.post(
        "https://api.github.com/repos/wangsijie/note/issues",
        { title, body: content.join('\n') },
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
