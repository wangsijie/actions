const axios = require('axios');

module.exports.getPoolInfo = async () => {
  const res = await axios.get(`https://pool.binance.com/mining-api/v1/public/pool/stat?observerToken=${process.env.BN_TOKEN}`);
  const { invalidNum, profitYesterday } = res.data.data;
  const res2 = await axios.get(`https://pool.binance.com/mining-api/v1/public/pool/miner/index?observerToken=${process.env.BN_TOKEN}`);
  const { workerDatas } = res2.data.data;
  const yyyRate = Math.floor(workerDatas.find(worker => worker.workerName === '0003').dayHashRate / 1000000 * 0.41);
  const totalRate = Math.floor(workerDatas.reduce((p, worker) => p + worker.dayHashRate, 0) / 1000000);
  return { invalidNum, paid: Number(profitYesterday.ETH), yyyRate, totalRate };
}
