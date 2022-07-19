const { InfluxDB } = require("@influxdata/influxdb-client");

const org = process.env.INFLUX_ORG;
const bucket =
  process.env.TEST_MODE === "true" ? "events-test" : process.env.INFLUX_BUCKET;

const client = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
});

const { Point } = require("@influxdata/influxdb-client");
const writeApi = client.getWriteApi(org, bucket);
const queryApi = client.getQueryApi(org);

const writeDeploymentEvent = (deployment) => {
  const timestamp = deployment.timestamp
    ? new Date(deployment.timestamp)
    : new Date();
  for (const change of deployment.changes) {
    timestamp.setTime(timestamp.getTime() + 1);
    const point = new Point("deployment")
      .stringField("id", deployment.id)
      .stringField("change", change)
      .tag("repo", deployment.repo)
      .timestamp(new Date(timestamp));

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

const createTestBucket = async () => {
  const axios = require("axios");
  const res = await axios.get(
    `${process.env.INFLUX_URL}/api/v2/orgs?org=${org}`,
    {
      headers: {
        Authorization: `Token ${process.env.INFLUX_TOKEN}`,
      },
    }
  );

  const orgId = res.data.orgs[0].id;
  return axios.post(
    `${process.env.INFLUX_URL}/api/v2/buckets`,
    {
      orgId: orgId,
      name: "events-test",
      retentionRules: [{ everySeconds: 0, type: "expire" }],
    },
    {
      headers: {
        Authorization: `Token ${process.env.INFLUX_TOKEN}`,
        "Content-type": "application/json",
      },
    }
  );
};

module.exports = {
  writeDeploymentEvent,
  writeChangeEvent,
  writeIncidentEvent,
  writeRestoreEvent,
  flush,
  queryEvents,
  queryLastDeployEvent,
  createTestBucket,
};
