import axios from "axios";
import moment from "moment";

interface PoolStatResponse {
  today_paid: number;
  workers: Array<[string, number, number, number, number, number, string]>;
}

const calcDailyRate = (rates: number): number =>
  Math.floor(rates / 24 / 3600 / 1000000);

export const getPoolInfo = async () => {
  if (!process.env.F2POOL) {
    throw new Error("F2POOL is missing");
  }
  const {
    data: { workers, today_paid },
  } = await axios.get<PoolStatResponse>(
    `hhttps://api.f2pool.com/eth/${process.env.F2POOL}`
  );
  const worker3 = workers.find((worker) => worker[0] === "0003");
  if (!worker3) {
    throw new Error("can not find worker3");
  }
  const yyyRate = calcDailyRate(worker3[4] * 0.42);
  const totalRate = calcDailyRate(
    workers.reduce((p, worker) => p + worker[4], 0)
  );
  const invalidWorkers = workers
    .filter((worker) => moment(worker[6]).add(15, "minutes").isBefore(moment()))
    .map((worker) => worker[0]);
  return { paid: today_paid, yyyRate, totalRate, invalidWorkers };
};
