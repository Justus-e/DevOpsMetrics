const { InfluxDB } = require("@influxdata/influxdb-client");

const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

console.log(process.env.INFLUX_URL);

const client = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
});

const { Point } = require("@influxdata/influxdb-client");
const writeApi = client.getWriteApi(org, bucket);
const queryApi = client.getQueryApi(org);

const writeDeploymentEvent = (deployment) => {
  for (const change of deployment.changes) {
    const point = new Point("deployment")
      .stringField("id", deployment.id)
      .stringField("change", change)
      .tag("repo", deployment.repo)
      .timestamp(new Date());

    console.log("writing point:", point);

    writeApi.writePoint(point);
  }
  return flush();
};

/*
 * use flush() after this function
 */
const writeChangeEvent = (change) => {
  const point = new Point("change")
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
  return flush();
};
const writeRestoreEvent = (restore) => {
  const point = new Point("restore")
    .stringField("id", restore.id)
    .tag("repo", restore.repo)
    .timestamp(new Date(restore.timestamp));
  writeApi.writePoint(point);
  return flush();
};

const queryEvents = (query) => {
  return queryApi.collectRows(query).catch((error) => {
    console.error(error);
  });
};

const queryLastDeployEvent = () => {
  const query = `
    from(bucket: "${bucket}") 
    |> range(start: -100d) 
    |> filter(fn: (r) => r._measurement == "deployment" and r._field == "id") 
    |> last()`;

  return queryApi.collectRows(query).catch((error) => {
    console.error(error);
  });
};

const flush = () => {
  return writeApi.flush();
};

module.exports = {
  writeDeploymentEvent,
  writeChangeEvent,
  writeIncidentEvent,
  writeRestoreEvent,
  flush,
  queryEvents,
  queryLastDeployEvent,
};
