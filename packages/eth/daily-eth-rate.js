const axios = require('axios');
const moment = require('moment');
const { getPoolInfo } = require('./binance');
const ots = require('./ots').client;

async function getEthPrice() {
    const res = await axios.get('https://coinmarketcap.com/zh/currencies/ethereum/');
    const search = /¥([^\s]*)\sCNY/.exec(res.data);
    return Number(search[1].replace(',', ''));
}

async function app() {
    const { yyyRate, totalRate } = await getPoolInfo();
    const ethPrice = await getEthPrice();
    const date = moment().format('YYYYMMDD');
    const wsj = {
        ethPrice,
        rate: totalRate - yyyRate,
    };
    const yyy = {
        ethPrice,
        rate: yyyRate,
    };
    if (process.env.NODE_ENV === 'production') {
        await ots.putRow('log', { name: 'wsj', date }, wsj);
        await ots.putRow('log', { name: 'yyy', date }, yyy);
    } else {
        console.log(wsj, yyy);
    }
}

app();
