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
    case "deployment_status":
      return evaluateDeploymentStatusEvent(payload);
    case "issue":
      return evaluateIssueEvent(payload);
    case "pull_request":
      return evaluatePullRequestEvent(payload);
    default:
      throw new Error("unknown type of event");
  }
};

const evaluatePushEvent = (payload) => {
  const commits = payload.commits;
  console.log(commits.length);
  for (const commit of commits) {
    influx.writeChangeEvent({
      pushSha: payload.after,
      ref: payload.ref,
      id: commit.id,
      timestamp: commit.timestamp,
    });
  }
  influx.flush();
};

const evaluateDeploymentStatusEvent = (payload) => {
  if (payload.deployment_status.state === "success")
    influx.writeDeploymentEvent({
      sha: payload.deployment.sha,
      timestamp: payload.deployment.updated_at,
    });
};

const evaluateIssueEvent = (payload) => {
  //TODO: implement test test test test test
};

const evaluatePullRequestEvent = (payload) => {
  //TODO: implement
};

module.exports = router;
