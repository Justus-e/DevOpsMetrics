const {InfluxDB} = require('@influxdata/influxdb-client')

// You can generate an API token from the "API Tokens Tab" in the UI

const org = process.env.INFLUX_ORG
const bucket = process.env.INFLUX_BUCKET

const client = new InfluxDB({url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN})

const {Point} = require('@influxdata/influxdb-client')
const writeApi = client.getWriteApi(org, bucket)
const queryApi = client.getQueryApi(org)

const writeEvent = (eventType) => {
    const point = new Point(eventType).booleanField('success',true)
    writeApi.writePoint(point)
    flush()
}

const queryDeployEvents = () => {

    const query = `from(bucket: "events") |> range(start: -1h)`
    queryApi.queryRows(query, {
        next(row, tableMeta) {
            const o = tableMeta.toObject(row)
            console.log(`${o._time} ${o._measurement}: ${o._field}=${o._value}`)
        },
        error(error) {
            console.error(error)
            console.log('Finished ERROR')
        },
        complete() {
            console.log('Finished SUCCESS')
        },
    })

}

const flush = () => {
    writeApi
        .close()
        .then(() => {
            console.log('FINISHED')
        })
        .catch(e => {
            console.error(e)
            console.log('Finished ERROR')
        })
}

module.exports = {writeEvent, flush, queryDeployEvents}
