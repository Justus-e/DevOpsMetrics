require('dotenv').config()

const influx = require('../influx');

const getMetric = async () => {
    const data = await influx.queryEvents('deployment', '-7d')
    return data.length / 7
}

//getMetric().then(res => console.log(res))
module.exports = {getMetric}
