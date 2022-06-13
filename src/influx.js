const { InfluxDB } = require("@influxdata/influxdb-client");

const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

const client = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
});

const { Point } = require("@influxdata/influxdb-client");
const writeApi = client.getWriteApi(org, bucket);
const queryApi = client.getQueryApi(org);

const writeDeploymentEvent = (deployment) => {
  const point = new Point("deployment")
    .stringField("sha", deployment.sha)
    .timestamp(new Date(deployment.timestamp));

  writeApi.writePoint(point);
  flush();
};

const writeChangeEvent = (change) => {
  const point = new Point("change")
    .stringField("pushSha", change.pushSha)
    .stringField("id", change.id)
    .stringField("ref", change.ref)
    .timestamp(new Date(change.timestamp));
  writeApi.writePoint(point);
};

const writeIncidentEvent = () => {
  const point = new Point("incident").booleanField("success", true);
  writeApi.writePoint(point);
  flush();
};
const writeRestoreEvent = () => {
  const point = new Point("restore").booleanField("success", true);
  writeApi.writePoint(point);
  flush();
};

const queryEvents = (eventType, range) => {
  const query = `from(bucket: "${bucket}") |> range(start: ${range}) |> filter(fn: (r) => r._measurement == "${eventType}")`;

  return queryApi.collectRows(query).catch((error) => {
    console.error(error);
    console.log("\nCollect ROWS ERROR");
  });
};

const flush = () => {
  writeApi
    .flush()
    .then(() => {
      console.log("FINISHED");
    })
    .catch((e) => {
      console.error(e);
      console.log("Finished ERROR");
    });
};

module.exports = {
  writeDeploymentEvent,
  writeChangeEvent,
  writeIncidentEvent,
  writeRestoreEvent,
  flush,
  queryEvents,
};
