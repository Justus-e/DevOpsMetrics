import influx from "../influx";

const bucket = process.env.INFLUX_BUCKET;

const getMetric = async () => {
  const query = `
    deploys = from(bucket: "${bucket}")
    |> range(start: -1w)
    |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "change")

    changes = from(bucket: "${bucket}")
    |> range(start: -1w)
    |> filter(fn: (r) => r["_measurement"] == "change" and r["_field"] == "id")

    join(
        tables: {change:changes, deploy:deploys},
        on: ["_value"],
    )
    |> map(fn: (r) => ({_value: uint(v: r["_time_deploy"]) - uint(v: r["_time_change"])}))
    |> mean()
    `;

  return influx.queryEvents(query);
};

export default getMetric;
