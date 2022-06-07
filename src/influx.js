const {InfluxDB} = require('@influxdata/influxdb-client')

// You can generate an API token from the "API Tokens Tab" in the UI

const org = process.env.INFLUX_ORG
const bucket = process.env.INFLUX_BUCKET

const client = new InfluxDB({url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN})

const {Point} = require('@influxdata/influxdb-client')
const writeApi = client.getWriteApi(org, bucket)
const queryApi = client.getQueryApi(org)

const writeEvent = (eventType) => {
    const point = new Point(eventType).booleanField('success', true)
    writeApi.writePoint(point)
    flush()
}

const queryEvents = (eventType, range) => {

    const query = `from(bucket: "${bucket}") |> range(start: ${range}) |> filter(fn: (r) => r._measurement == "${eventType}")`

    return queryApi
        .collectRows(query)
        .catch(error => {
            console.error(error)
            console.log('\nCollect ROWS ERROR')
        })

}

const flush = () => {
    writeApi
        .flush()
        .then(() => {
            console.log('FINISHED')
        })
        .catch(e => {
            console.error(e)
            console.log('Finished ERROR')
        })
}

module.exports = {writeEvent, flush, queryEvents}
