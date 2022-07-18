const influx = require("../influx");
const bucket = process.env.INFLUX_BUCKET;

const getMetric = async (timeRange = "1w", inSeconds = true) => {
  const query = `
    deploys = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "change")

    changes = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "change" and r["_field"] == "id")

    join(
        tables: {change:changes, deploy:deploys},
        on: ["_value"],
    )
    |> map(fn: (r) => ({_value: uint(v: r["_time_deploy"]) - uint(v: r["_time_change"])}))
    |> mean()
    `;

  const res = await influx.queryEvents(query);

  if (res.length !== 1) {
    console.warn("Lead Time could not be queried");
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

  deploys = from(bucket: "${bucket}")
  |> range(start: -${timeRange})
  |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "change")

  changes = from(bucket: "${bucket}")
  |> range(start: -${timeRange})
  |> filter(fn: (r) => r["_measurement"] == "change" and r["_field"] == "id")

  join(
    tables: {change:changes, deploy:deploys},
    on: ["_value"],
  )
  |> map(fn: (r) => ({_value: uint(v: r["_time_deploy"]) - uint(v: r["_time_change"]), _time: r["_time_deploy"]}))
  |> aggregateWindow(every: ${aggregateInterval}, fn: mean, createEmpty: ${createEmpty})
  `;

  const res = await influx.queryEvents(query);
  return res.map((it) => ({
    time: it._time,
    value: typeof it._value === "number" ? it._value / Math.pow(10, 9) : null,
  }));
};

module.exports = { getMetric, getMetricOverTime };
