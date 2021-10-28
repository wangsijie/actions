const axios = require("axios");
const { getPoolInfo } = require("./binance");

async function app() {
  const { invalidNum } = await getPoolInfo();
  if (invalidNum) {
    await axios.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`, {
      chat_id: process.env.TG_CHAT_ID_ALERT,
      text: '有矿机超过10分钟没有活动',
    });
  }
  console.log(invalidNum);
}

app();
