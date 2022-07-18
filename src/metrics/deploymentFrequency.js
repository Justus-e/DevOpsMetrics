const influx = require("../influx");
const bucket = process.env.INFLUX_BUCKET;

const getMetric = async (timeRange = "1w") => {
  const query = `
      from(bucket: "${bucket}")
      |> range(start: -${timeRange})
      |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "id")
      |> unique(column: "_value")
      |> elapsed()
      |> mean(column: "elapsed")
      `;

  const res = await influx.queryEvents(query);

  if (res.length !== 1) {
    console.warn("Deployment Frequency could not be queried");
    return 0;
  }

  return res[0].elapsed;
};

const getMetricOverTime = async (
  timeRange = "1w",
  aggregateInterval = "1d",
  createEmpty = false
) => {
  const query = `
    from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "id")
    |> unique(column: "_value")
    |> elapsed()
    |> map(fn: (r) => ({_value: r["elapsed"], _time: r["_time"]}))
    |> aggregateWindow(every: ${aggregateInterval}, fn: mean, createEmpty: ${createEmpty})
  `;

  const res = await influx.queryEvents(query);
  return res.map((it) => ({ time: it._time, value: it._value }));
};

module.exports = { getMetric, getMetricOverTime };
