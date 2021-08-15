const hashrates = {
  "0003": 98 + 97 + 107 + 107 + 107,
  taishiji: 91,
  "0001": 325,
  "0002": 474,
};
const hashrate = Object.values(hashrates).reduce((p, value) => p + value, 0);
const hashrate_yyy = hashrates["0003"] - 98 - 97 - 107;
const hashrate_wsj = hashrate - hashrate_yyy;
const cost_wsj = 202189;
const cost_yyy = 49600;
const cost = cost_wsj + cost_yyy;
const yyy = hashrate_yyy / hashrate;

module.exports = {
  hashrates,
  hashrate,
  hashrate_yyy,
  hashrate_wsj,
  cost_wsj,
  cost_yyy,
  cost,
  yyy,
  wsj: 1 - yyy,
};
