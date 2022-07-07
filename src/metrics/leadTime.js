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
    throw Error("Lead Time could not be queried");
  }

  if (inSeconds) {
    return res[0]._value / Math.pow(10, 9);
  } else {
    return res[0]._value;
  }
};

module.exports = getMetric;
