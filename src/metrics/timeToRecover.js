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
    console.warn("Time to Recover could not be queried");
    return 0;
  }

  if (inSeconds) {
    return res[0]._value / Math.pow(10, 9);
  } else {
    return res[0]._value;
  }
};

const getMetricOverTime = async (
  timeRange = "1w",
  aggregateInterval = "1d",
  createEmpty = false
) => {
  const query = `
    import "date"

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
    |> map(fn: (r) => ({_value: uint(v: r["_time_restore"]) - uint(v: r["_time_incident"]), _time: r["_time_incident"]}))
    |> aggregateWindow(every: ${aggregateInterval}, fn: mean, createEmpty: ${createEmpty})
  `;

  const res = await influx.queryEvents(query);
  return res.map((it) => ({
    time: it._time,
    value: typeof it._value === "number" ? it._value / Math.pow(10, 9) : null,
  }));
};

module.exports = { getMetric, getMetricOverTime };
