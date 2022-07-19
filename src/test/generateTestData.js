const fs = require("fs");

const changes = [];
const deployments = [];
const incidents = [];
const restores = [];

const data = fs.readFileSync("./src/test/testshas.txt", { encoding: "utf8" });

const shas = data.split(/\r?\n/);
shas.pop();
const date = new Date();
shas.forEach((sha) => {
  date.setTime(date.getTime() - Math.random() * 72 * 3600000);
  changes.push({
    id: sha,
    timestamp: new Date(date),
    ref: "master",
    repo: "testRepo",
  });
});

const incidentAmount = Math.floor(Math.random() * 15) + 5;

for (let i = 0; i <= incidentAmount; i++) {
  incidents.push({
    id: shas[i],
    timestamp: new Date(
      changes[0].timestamp.getTime() +
        Math.random() *
          (changes[changes.length - 1].timestamp.getTime() -
            changes[0].timestamp.getTime())
    ),
    repo: "testRepo",
  });
}

incidents.forEach((incident) => {
  restores.push({
    id: incident.id,
    timestamp: new Date(
      incident.timestamp.getTime() + Math.random() * 6 * 3600000
    ),
    repo: "testRepo",
  });
});

while (shas.length > 0) {
  const temp = shas.splice(0, Math.ceil(Math.random() * 6));
  const timestamp = new Date(changes.find((it) => it.id === temp[0]).timestamp);
  timestamp.setTime(timestamp.getTime() + Math.random() * 6 * 3600000);
  deployments.push({
    id: temp[0],
    changes: temp,
    repo: "testRepo",
    timestamp: timestamp,
  });
}

module.exports = { changes, deployments, incidents, restores };
