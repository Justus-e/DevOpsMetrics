const influx = require("../influx");
const bucket = process.env.INFLUX_BUCKET;

const getMetric = async () => {
  const query = `
      from(bucket: "${bucket}")
      |> range(start: -1w)
      |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "id")
      |> unique(column: "_value")
      |> aggregateWindow(every: 1d, fn: count)
      |> mean()
      `;

  return influx.queryEvents(query);
};

module.exports = getMetric;
