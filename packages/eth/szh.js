const axios = require("axios");

async function app() {
  const res = await axios.get(`https://pool.binance.com/mining-api/v1/public/pool/stat?observerToken=${process.env.BN_TOKEN}`);
  const { invalidNum } = res.data.data;
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
