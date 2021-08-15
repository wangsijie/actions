const axios = require('axios');

async function getPoolInfo() {
  const res = await axios.get(`https://api.f2pool.com/eth/${process.env.F2POOL_USERNAME}`);
  const yyyRate = res.data.workers.find(worker => worker[0] === '0003')[4] / 24 / 3600 / 1000000 - 98 - 97 - 107;
  const totalRate = res.data.workers.reduce((p, worker) => p + worker[4], 0) / 24 / 3600 / 1000000;
  return {
      paid: res.data.today_paid,
      yyyRate: Math.floor(yyyRate),
      totalRate: Math.floor(totalRate),
  };
}

module.exports.getPoolInfo = getPoolInfo;
