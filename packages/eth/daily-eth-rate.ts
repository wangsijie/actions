import axios from "axios";
import moment from "moment";
import { getPoolInfo } from "./f2pool";
import { getMinerLogs, updateMinerLogs } from "./gist";

async function getEthPrice() {
  const res = await axios.get(
    "https://coinmarketcap.com/zh/currencies/ethereum/"
  );
  const search = /¥([^\s]*)\sCNY/.exec(res.data);
  if (!search || !search[1]) {
    throw new Error('error getting eth price');
  }
  return Number(search[1].replace(",", ""));
}

async function app() {
  const { yyyRate, totalRate } = await getPoolInfo();
  const ethPrice = await getEthPrice();
  const date = moment().format("YYYYMMDD");
  const wsj = {
    ethPrice,
    rate: totalRate - yyyRate,
  };
  const yyy = {
    ethPrice,
    rate: yyyRate,
  };
  if (process.env.NODE_ENV === "production") {
    const logs = await getMinerLogs();
    if (logs.find(log => log.date === date)) {
      throw new Error('今日已经生成过了');
    }
    logs.push({ ...wsj, name: "wsj", date, eth: 0, rmb: 0 });
    logs.push({ ...yyy, name: "yyy", date, eth: 0, rmb: 0 });
    await updateMinerLogs(logs);
  } else {
    console.log(wsj, yyy);
  }
}

app();
