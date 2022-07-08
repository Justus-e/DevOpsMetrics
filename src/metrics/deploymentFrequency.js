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
    throw Error("Deployment Frequency could not be queried");
  }

  return res[0].elapsed;
};

module.exports = getMetric;
