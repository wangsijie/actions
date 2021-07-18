const axios = require('axios');
const moment = require('moment');

async function app() {
    const res = await axios.get('https://api.f2pool.com/eth/sflydragon');
    const now = moment();
    for (const worker of res.data.workers) {
        const name = worker[0];
        const time = worker[6];
        console.log(name, moment(time).unix(), now.unix());
        if (moment(time).add(10, 'minutes').isBefore(now)) {
            await axios.post(
                `https://open.feishu.cn/open-apis/bot/v2/hook/${process.env.FEISHU_BOT}`,
                {
                    "msg_type": "text",
                    "content": {
                        "text": `矿机${name}超过10分钟没有活动`
                    }
                },
            );
        }
    }
}

app();
