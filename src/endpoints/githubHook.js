const express = require("express");
const router = express.Router();
const influx = require("../influx");

//TODO: Add swagger doku
router.post("/github-hook", async (req, res) => {
  try {
    const eventType = req.header("X-GitHub-Event");
    evaluateEvent(eventType, req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const evaluateEvent = (eventType, payload) => {
  switch (eventType) {
    case "push":
      return evaluatePushEvent(payload);
    case "deployment":
      return evaluateDeploymentEvent(payload);
    case "issue":
      return evaluateIssueEvent(payload);
    default:
      throw new Error("unknown type of event");
  }
};

const evaluatePushEvent = (payload) => {
  const commits = payload.commits;
  for (const commit of commits) {
    influx.writeChangeEvent({
      pushSha: payload.after,
      id: commit.id,
      timestamp: commit.timestamp,
    });
  }
  influx.flush();
};

const evaluateDeploymentEvent = (payload) => {
  influx.writeDeploymentEvent({
    sha: payload.deployment.sha,
    timestamp: payload.deployment.created_at,
  });
};

const evaluateIssueEvent = (payload) => {
  //TODO: implement
};

module.exports = router;
