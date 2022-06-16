const express = require("express");
const router = express.Router();
const influx = require("../influx");

/**
 * @swagger
 *  tags:
 *      name: GitHub Webhook
 *      description: Endpoint for GitHub WebHooks to post to
 */

/**
 * @swagger
 * /github-hook:
 *  post:
 *      summary: Post GitHub Webhook events here
 *      tags: [GitHub Webhook]
 *      responses:
 *          200:
 *              description: OK
 */
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
    case "issues":
      return evaluateIssuesEvent(payload);
    default:
      throw new Error("unknown type of event");
  }
};

const evaluatePushEvent = (payload) => {
  const commits = payload.commits;
  console.log(commits.length);
  for (const commit of commits) {
    influx.writeChangeEvent({
      pushSha: payload.after, // todo: maybe not necessary
      ref: payload.ref,
      id: commit.id,
      timestamp: commit.timestamp,
      repo: payload.repository.full_name,
    });
  }
  influx.flush();
};

const evaluateDeploymentStatusEvent = (payload) => {
  if (payload.deployment_status.state === "success")
    influx.writeDeploymentEvent({
      id: payload.deployment.sha,
      timestamp: payload.deployment.updated_at,
      repo: payload.repository.full_name,
    });
};

const evaluateIssuesEvent = (payload) => {
  if (payload.action === "labeled" && payload.label.name === "incident") {
    influx.writeIncidentEvent({
      id: payload.issue.id,
      timestamp: payload.issue.created_at,
      repo: payload.repository.full_name,
    });
  }

  if (payload.action === "closed" && hasLabel(payload.issue, "incident")) {
    influx.writeRestoreEvent({
      id: payload.issue.id,
      timestamp: payload.issue.closed_at,
      repo: payload.repository.full_name,
    });
  }
};

const hasLabel = (issue, labelName) => {
  return !!issue.labels.find((label) => label.name === labelName);
};

module.exports = router;
