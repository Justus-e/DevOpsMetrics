const influx = require("../influx");
const bucket = process.env.INFLUX_BUCKET;

const getMetric = async (timeRange = "1w", inSeconds = true) => {
  const query = `
    incident = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "incident")

    restore = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "restore")

    join(
        tables: {incident:incident, restore:restore},
        on: ["_value"],
    )
    |> map(fn: (r) => ({_value: uint(v: r["_time_restore"]) - uint(v: r["_time_incident"])}))
    |> mean()
    `;

  const res = await influx.queryEvents(query);

  if (res.length !== 1) {
    throw Error("Time to Recover could not be queried");
  }

  if (inSeconds) {
    return res[0]._value / Math.pow(10, 9);
  } else {
    return res[0]._value;
  }
};

module.exports = getMetric;
