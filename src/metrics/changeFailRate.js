const influx = require("../influx");
const bucket = process.env.INFLUX_BUCKET;

const getMetric = async (timeRange = "1w") => {
  const query = `
    import "array"
    incident = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "incident")
    |> count()
    |> findColumn(
        fn: (key) => key._field == "id",
        column: "_value",
      )

    deployment = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "id")
    |> unique(column: "_value")
    |> count()
    |> findColumn(
        fn: (key) => key._field == "id",
        column: "_value",
      )

    array.from(rows: 
      if deployment |> length() == 1 and incident |> length() == 1 then
        [{_value: float(v: incident[0]) / float(v: deployment[0]) }]
      else 
        [{_value: float(v: 0)}] 
    )
    `;

  const res = await influx.queryEvents(query);

  if (res.length !== 1) {
    throw Error("Change Fail Rate could not be queried");
  }

  return res[0]._value;
};

module.exports = getMetric;
