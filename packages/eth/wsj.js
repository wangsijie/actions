const axios = require("axios");
const { getPoolInfo } = require("./binance");

async function app() {
  const { invalidNum } = await getPoolInfo();
  if (invalidNum) {
    await axios.get(
      `https://push.bot.qw360.cn/send/${process.env.WXBOT}`,
      {
        params: { msg: `有矿机超过10分钟没有活动` },
      }
    );
  }
  console.log(invalidNum);
}

app();
