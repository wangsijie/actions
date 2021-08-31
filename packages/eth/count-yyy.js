const moment = require("moment");
const ots = require("./ots").client;
const TS = require("./ots").TS;

async function app(start, end) {
  const rows = await ots.getRows(
    "log",
    { name: TS.INF_MIN, date: TS.INF_MIN },
    { name: TS.INF_MAX, date: TS.INF_MAX }
  );
  const sum =
    rows
      .filter((r) => r.name === "yyy")
      .filter((r) => moment(r.date).isBetween(moment(start), moment(end), undefined, '[]'))
      .reduce((p, r) => p + (r.eth || 0), 0) /
    10 ** 8;
  return sum;
}

app('20210831', '20210831').then(console.log);
