const ets = require('easy-tablestore');

const client = new ets.default({
    accessKeyId: process.env.OTS_AK,
    accessKeySecret: process.env.OTS_SK,
    endpoint: 'https://miner.cn-shanghai.ots.aliyuncs.com',
    instancename: 'miner',
});

module.exports.client = client;
module.exports.TS = ets.TS;
