import axios from 'axios';
import { getPoolInfo } from './f2pool';

async function app() {
  const { invalidWorkers } = await getPoolInfo();
  if (invalidWorkers.length) {
    await axios.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`, {
      chat_id: process.env.TG_CHAT_ID_ALERT,
      text: `矿机没有活动: ${invalidWorkers.join(',')}`,
    });
  }
  console.log(invalidWorkers);
}

app();
