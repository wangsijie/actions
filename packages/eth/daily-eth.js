const axios = require('axios');
const moment = require('moment');
const config = require('./config');
const ots = require('./ots').client;
const TS = require('./ots').TS;
const { getPoolInfo } = require('./f2pool');

async function getHistoryEth() {
    const rows = await ots.getRows(
        'log',
        { name: TS.INF_MIN, date: TS.INF_MIN },
        { name: TS.INF_MAX, date: TS.INF_MAX },
    );
    const wsj = rows.filter(r => r.name === 'wsj').reduce((p, r) => p + (r.eth || 0), 0) / (10 ** 8);
    const yyy = rows.filter(r => r.name === 'yyy').reduce((p, r) => p + (r.eth || 0), 0) / (10 ** 8);
    return { wsj, yyy };
}

async function app() {
    const { paid } = await getPoolInfo();
    const date = moment().format('YYYYMMDD');
    const wsjRow = await ots.getRow('log', { name: 'wsj', date });
    const yyyRow = await ots.getRow('log', { name: 'yyy', date });
    const yyyRate = yyyRow.rate;
    const wsjRate = wsjRow.rate;
    const totalRate = yyyRate + wsjRate;
    const yyyShare = yyyRate / totalRate;
    const wsjShare = wsjRate / totalRate;
    const ethPrice = wsjRow.ethPrice;
    const wsj = {
        eth: paid * wsjShare * (10 ** 8),
        rmb: Math.floor(paid * wsjShare * ethPrice),
        ethPrice,
        rate: wsjRate,
    };
    const yyy = {
        eth: paid * yyyShare * (10 ** 8),
        rmb: Math.floor(paid * yyyShare * ethPrice),
        ethPrice,
        rate: yyyRate,
    };
    if (process.env.NODE_ENV === 'production') {
        await ots.putRow('log', { name: 'wsj', date }, wsj);
        await ots.putRow('log', { name: 'yyy', date }, yyy);
    }
    const { wsj: wsjHistory, yyy: yyyHistory } = await getHistoryEth();
    const wsjHistoryRmb = Math.floor(wsjHistory * ethPrice);
    const yyyHistoryRmb = Math.floor(yyyHistory * ethPrice);
    const wsjMessage = `wsj: 昨日算力${totalRate - yyyRate}M，共挖eth: ${Math.floor(wsj.eth / 10 ** 4) / 10 ** 4}(¥${wsj.rmb})，历史已挖：${wsjHistory}(¥${wsjHistoryRmb})，回本进度：${Math.floor(wsjHistoryRmb / config.cost_wsj * 1000) / 10}%`;
    const yyyMessage = `yyy: 昨日算力${yyyRate}M，共挖eth: ${Math.floor(yyy.eth / 10 ** 4) / 10 ** 4}(¥${yyy.rmb})，历史已挖：${yyyHistory}(¥${yyyHistoryRmb})，回本进度：${Math.floor(yyyHistoryRmb / config.cost_yyy * 1000) / 10}%`;
    if (process.env.NODE_ENV === 'production') {
        const res = await axios.get(
            `https://push.bot.qw360.cn/room/${process.env.WXBOT}`,
            {
                params: {
                    msg: `${wsjMessage}\n${yyyMessage}`,
                },
            },
        );
        console.log(res.data);
    } else {
        console.log(wsjMessage);
        console.log(yyyMessage);
    }
}

app();
