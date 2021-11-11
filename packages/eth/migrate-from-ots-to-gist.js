const ots = require('./ots').client;
const TS = require('./ots').TS;
const axios = require('axios');

async function migrate() {
  const rows = await ots.getRows(
    "log",
    { name: TS.INF_MIN, date: TS.INF_MIN },
    { name: TS.INF_MAX, date: TS.INF_MAX }
  );
  await axios.patch(
    `https://api.github.com/gists/${process.env.GIST_KEY}`,
    { files: { 'eth-miner-log.json': { content: JSON.stringify(rows) } } },
    {
      headers: {
        accept: "application/vnd.github.v3+json",
        authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
}

migrate();
