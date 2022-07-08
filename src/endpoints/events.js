const express = require("express");
const router = express.Router();
const influx = require("../influx");
const joi = require("joi");

/** Event MODEL
 * @swagger
 *  components:
 *      schemas:
 *          Event:
 *              type: object
 *              properties:
 *                  eventType:
 *                      type: string
 *                      required: true
 *                      description: type of event ('deployment' | 'change' | 'incident' | 'restore')
 *                      example: "deployment"
 *                  payload:
 *                      oneOf:
 *                          - $ref: '#/components/schemas/deployment'
 *                          - $ref: '#/components/schemas/change'
 *                          - $ref: '#/components/schemas/incident'
 *                          - $ref: '#/components/schemas/restore'
 *                      description: payload specific to the Event
 */

/** Event MODEL
 * @swagger
 * components:
 *   schemas:
 *     deployment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: sha of the triggering commit for the deployment
 *           example: "dd05f3119a18f53d1e782384b8f47751479de472"
 *         changes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["dd05f3119a18f53d1e782384b8f47751479de472", "79e10eec267bf99ec5a67acb28bc24b0eca1977a", "13fcc20de75badd00c2e1c94423a97383a4f2137"]
 *           required: true
 *           description: SHAs of all commits after last deployment commit until now
 *         repo:
 *           type: string
 *           required: true
 *           description: name of the repository
 *           example: "justus-e/DevOpsMetrics"
 *     change:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: sha of the commit
 *           example: "dd05f3119a18f53d1e782384b8f47751479de472"
 *         timestamp:
 *           type: string
 *           required: true
 *           description: timestamp which should be used in calculation for this change
 *           example: "2021-01-25T13:55:52Z"
 *         ref:
 *           type: string
 *           required: true
 *           description: branch name of commit
 *           example: "refs/heads/main"
 *         repo:
 *           type: string
 *           required: true
 *           description: name of the repository
 *           example: "justus-e/DevOpsMetrics"
 *     incident:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: custom id, it is used to reference the same issue from incident and restore event
 *           example: "1277125853"
 *         timestamp:
 *           type: string
 *           required: true
 *           description: timestamp which should be used in calculation for this incident
 *           example: "2021-01-25T15:55:52Z"
 *         repo:
 *           type: string
 *           required: true
 *           description: name of the repository
 *           example: "justus-e/DevOpsMetrics"
 *     restore:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: custom id, it is used to reference the same issue from incident and restore event
 *           example: "1277125853"
 *         timestamp:
 *           type: string
 *           required: true
 *           description: timestamp which should be used in calculation for this incident
 *           example: "2021-01-26T12:31:12Z"
 *         repo:
 *           type: string
 *           required: true
 *           description: name of the repository
 *           example: "justus-e/DevOpsMetrics"
 */

/**
 * @swagger
 *  tags:
 *      name: Events
 *      description: Endpoint to post events
 */

/**
 * @swagger
 * /events:
 *  post:
 *      summary: Add a new Event
 *      tags: [Events]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Event'
 *      responses:
 *          200:
 *              description: 'Event successfully added'
 */
router.post("/events", (req, res) => {
  try {
    joi.assert(req.body, requestSchema);

    const { eventType, payload } = req.body;
    switch (eventType) {
      case "deployment":
        influx.writeDeploymentEvent(payload);
        break;
      case "change":
        influx.writeChangeEvent(payload);
        break;
      case "incident":
        influx.writeIncidentEvent(payload);
        break;
      case "restore":
        influx.writeRestoreEvent(payload);
    }
    res.status(200).send(`Event of type '${eventType}' added!`);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.annotate(true));
    }
    console.log(err);
    res.sendStatus(500);
  }
});

const requestSchema = joi.object({
  eventType: joi
    .any()
    .valid("deployment", "change", "incident", "restore")
    .required(),
  payload: joi.alternatives().conditional(joi.ref("eventType"), {
    switch: [
      {
        is: "deployment",
        then: joi.object({
          id: joi.string().required(),
          repo: joi.string().required(),
          changes: joi.array().items(joi.string()).required(),
        }),
      },
      {
        is: "change",
        then: joi.object({
          id: joi.string().required(),
          repo: joi.string().required(),
          timestamp: joi.date().required(),
          ref: joi.string().required(),
        }),
      },
      {
        is: joi.string().valid("incident", "restore"),
        then: joi.object({
          id: joi.string().required(),
          repo: joi.string().required(),
          timestamp: joi.date().required(),
        }),
      },
    ],
  }),
});

module.exports = router;
