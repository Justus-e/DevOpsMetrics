const influx = require("../influx");
const bucket = process.env.INFLUX_BUCKET;

const getMetric = async () => {
  const query = `
    incident = from(bucket: "${bucket}")
    |> range(start: -1w)
    |> filter(fn: (r) => r["_measurement"] == "incident")

    restore = from(bucket: "${bucket}")
    |> range(start: -1w)
    |> filter(fn: (r) => r["_measurement"] == "restore")

    join(
        tables: {incident:incident, restore:restore},
        on: ["_value"],
    )
    |> map(fn: (r) => ({_value: uint(v: r["_time_restore"]) - uint(v: r["_time_incident"])}))
    |> mean()
    `;

  return influx.queryEvents(query);
};

module.exports = getMetric;
