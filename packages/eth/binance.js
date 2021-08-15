const axios = require('axios');

module.exports.getPoolInfo = async () => {
  const res = await axios.get(`https://pool.binance.com/mining-api/v1/public/pool/stat?observerToken=${process.env.BN_TOKEN}`);
  const { invalidNum, profitYesterday } = res.data.data;
  return { invalidNum, profitYesterday };
}
