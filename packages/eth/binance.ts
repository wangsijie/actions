import axios from "axios";

interface PoolStatResponse {
  invalidNum: number;
  profitYesterday: { ETH: string };
}

interface PoolMinerResponse {
  workerDatas: {
    workerId: string;
    workerName: string;
    hashRate: number;
    status: number;
    dayHashRate: number;
    rejectRate: number;
    lastShareTime: number;
  }[];
}

interface BinanceResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export const getPoolInfo = async () => {
  if (!process.env.BN_TOKEN) {
    throw new Error("BN_TOKEN is missing");
  }
  const {
    data: {
      data: { invalidNum, profitYesterday },
    },
  } = await axios.get<BinanceResponse<PoolStatResponse>>(
    `https://pool.binance.com/mining-api/v1/public/pool/stat?observerToken=${process.env.BN_TOKEN}`
  );
  const {
    data: {
      data: { workerDatas },
    },
  } = await axios.get<BinanceResponse<PoolMinerResponse>>(
    `https://pool.binance.com/mining-api/v1/public/pool/miner/index?observerToken=${process.env.BN_TOKEN}`
  );
  const worker3 = workerDatas.find((worker) => worker.workerName === "0003");
  if (!worker3) {
    throw new Error('can nost find worker3');
  }
  const yyyRate = Math.floor(
    (worker3.dayHashRate /
      1000000) *
      0.41
  );
  const totalRate = Math.floor(
    workerDatas.reduce((p, worker) => p + worker.dayHashRate, 0) / 1000000
  );
  return { invalidNum, paid: Number(profitYesterday.ETH), yyyRate, totalRate };
};
