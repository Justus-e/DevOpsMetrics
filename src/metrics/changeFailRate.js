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
    console.warn("Change Fail Rate could not be queried");
    return 0;
  }

  return res[0]._value;
};

const getMetricOverTime = async (
  timeRange = "1w",
  aggregateInterval = "1d"
) => {
  const query = `
    import "array"
    import "date"

    incident = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "incident")
    |> aggregateWindow(every: ${aggregateInterval}, fn: count)
  
    deployment = from(bucket: "${bucket}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r["_measurement"] == "deployment" and r["_field"] == "id")
    |> unique(column: "_value")
    |> aggregateWindow(every: ${aggregateInterval}, fn: count)
 
    join(
    tables: {incident:incident, deployment:deployment},
    on: ["_time"],
    )
    |> map(fn: (r) => ({ 
    _value: 
        if r["_value_deployment"] == 0 then 
            float(v: 0)
        else
            float(v: r["_value_incident"]) / float(v: r["_value_deployment"]),
    _time: r["_time"]
    }))
  `;

  const res = await influx.queryEvents(query);
  console.log(res);
  return res.map((it) => ({ time: it._time, value: it._value }));
};

module.exports = { getMetric, getMetricOverTime };
