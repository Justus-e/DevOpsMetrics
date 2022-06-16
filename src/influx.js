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
    .stringField("id", deployment.sha)
    .tag("repo", deployment.repo)
    .timestamp(new Date(deployment.timestamp));

  writeApi.writePoint(point);
  flush();
};

/*
 * use flush() after this function
 */
const writeChangeEvent = (change) => {
  const point = new Point("change")
    .stringField("pushSha", change.pushSha)
    .stringField("id", change.id)
    .tag("ref", change.ref)
    .tag("repo", change.repo)
    .timestamp(new Date(change.timestamp));
  writeApi.writePoint(point);
};

const writeIncidentEvent = (incident) => {
  const point = new Point("incident")
    .stringField("id", incident.id)
    .tag("repo", incident.repo)
    .timestamp(new Date(incident.timestamp));
  writeApi.writePoint(point);
  flush();
};
const writeRestoreEvent = (restore) => {
  const point = new Point("restore")
    .stringField("id", restore.id)
    .tag("repo", restore.repo)
    .timestamp(new Date(restore.timestamp));
  writeApi.writePoint(point);
  flush();
};

const queryEvents = (eventType, range) => {
  const query = `from(bucket: "${bucket}") |> range(start: ${range}) |> filter(fn: (r) => r._measurement == "${eventType}")`;

  return queryApi.collectRows(query).catch((error) => {
    console.error(error);
  });
};

const flush = () => {
  writeApi.flush().catch((e) => {
    console.error(e);
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
