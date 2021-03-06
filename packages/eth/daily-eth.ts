import axios from "axios";
import moment from "moment";
import { getPoolInfo } from "./f2pool";
import { cost_wsj_eth, cost_yyy_eth } from "./config";
import { getLastPaid, getMinerLogs, updateGist, updateMinerLogs } from "./gist";

async function getHistoryEth() {
  const rows = await getMinerLogs();
  const wsj =
    rows.filter((r) => r.name === "wsj").reduce((p, r) => p + (r.eth || 0), 0) /
    10 ** 8;
  const yyy =
    rows.filter((r) => r.name === "yyy").reduce((p, r) => p + (r.eth || 0), 0) /
    10 ** 8;
  return { wsj, yyy };
}

async function app() {
  const { paid } = await getPoolInfo();
  const date = moment().format("YYYYMMDD");
  const logs = await getMinerLogs();
  const lastPaidAt = await getLastPaid();
  const wsjRow = logs.find((log) => log.date === date && log.name === "wsj");
  const yyyRow = logs.find((log) => log.date === date && log.name === "yyy");
  if (!wsjRow || !yyyRow) {
    throw new Error("rate row not found");
  }
  const yyyRate = yyyRow.rate;
  const wsjRate = wsjRow.rate;
  const totalRate = yyyRate + wsjRate;
  const yyyShare = yyyRate / totalRate;
  const wsjShare = wsjRate / totalRate;
  const ethPrice = wsjRow.ethPrice;
  const wsj = {
    eth: Math.floor(paid * wsjShare * 10 ** 8),
    rmb: Math.floor(paid * wsjShare * ethPrice),
    ethPrice,
    rate: wsjRate,
  };
  const yyy = {
    eth: Math.floor(paid * yyyShare * 10 ** 8),
    rmb: Math.floor(paid * yyyShare * ethPrice),
    ethPrice,
    rate: yyyRate,
  };
  if (process.env.NODE_ENV === "production") {
    const updatedLogs = logs.map((log) => {
      if (log.date === date && log.name === "wsj") {
        return {
          ...log,
          ...wsj,
        };
      }
      if (log.date === date && log.name === "yyy") {
        return {
          ...log,
          ...yyy,
        };
      }
      return log;
    });
    await updateMinerLogs(updatedLogs);
  }
  const { wsj: wsjHistory, yyy: yyyHistory } = await getHistoryEth();
  const wsjHistoryRmb = Math.floor(wsjHistory * ethPrice);
  const yyyHistoryRmb = Math.floor(yyyHistory * ethPrice);
  const wsjMessage = `wsj: ????????????${totalRate - yyyRate}M?????????eth: ${
    Math.floor(wsj.eth / 10 ** 4) / 10 ** 4
  }(??${wsj.rmb})??????????????????${wsjHistory}(??${wsjHistoryRmb})???????????????????????????${
    Math.floor((wsjHistory / cost_wsj_eth) * 1000) / 10
  }%`;
  const unpaid = logs
    .filter((log) => log.name === "yyy")
    .filter((log) =>
      moment(log.date).startOf("day").isAfter(lastPaidAt.startOf("day"))
    )
    .reduce((p, log) => p + log.eth, 0);
  const yyyMessage = `yyy: ????????????${yyyRate}M?????????eth: ${
    Math.floor(yyy.eth / 10 ** 4) / 10 ** 4
  }(??${yyy.rmb})??????????????????${yyyHistory}(??${yyyHistoryRmb})???????????????????????????${
    Math.floor((yyyHistory / cost_yyy_eth) * 1000) / 10
  }%??????????????????${(unpaid / 10 ** 8).toFixed(4)}`;
  const message = `${wsjMessage}\n\n${yyyMessage}`;
  if (process.env.NODE_ENV === "production") {
    await updateGist({ "summary.md": { content: message } });
    await axios.post(
      `https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TG_CHAT_ID_ETH_MINE_REPORT,
        text: `${wsjMessage}\n${yyyMessage}`,
      }
    );
  } else {
    console.log(wsjMessage);
    console.log(yyyMessage);
  }
}

app();
