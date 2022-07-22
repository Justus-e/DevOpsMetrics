console.warn("WARN: Application Started in Testing Mode!");
const {
  changes,
  deployments,
  restores,
  incidents,
} = require("./test/generateTestData");
const influx = require("./influx");

influx
  .createTestBucket()
  .then(() => {
    for (const change of changes) {
      influx.writeChangeEvent(change);
    }
    influx.flush();

    for (const deployment of deployments) {
      influx.writeDeploymentEvent(deployment);
    }

    for (const incident of incidents) {
      influx.writeIncidentEvent(incident);
    }

    for (const restore of restores) {
      influx.writeRestoreEvent(restore);
    }
    console.log("Test Data Created in Bucket: 'events-test'");
  })
  .catch((err) => {
    if (err.response && err.response.status === 422) {
      console.warn("Test Bucket already exists");
    } else {
      throw err;
    }
  });
