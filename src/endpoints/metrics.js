const express = require("express");
const router = express.Router();
const deploymentFrequency = require("../metrics/deploymentFrequency");
const leadTime = require("../metrics/leadTime");
const changeFailRate = require("../metrics/changeFailRate");
const timeToRecovery = require("../metrics/timeToRecover");
const joi = require("joi");

/** Metrics MODEL
 * @swagger
 *  components:
 *      schemas:
 *          Metrics:
 *              type: object
 *              properties:
 *                  deploymentFrequency:
 *                      type: number
 *                      description: The mean amount of seconds passed between two deployments
 *                  leadTime:
 *                      type: number
 *                      description: The mean amount of seconds passed between first commit and finished deployment of a code change
 *                  changeFailRate:
 *                      type: number
 *                      description: Percentage of deployments that caused an incident(between 0 and 1)
 *                  timeToRecovery:
 *                      type: number
 *                      description: The mean amount of seconds passed between the happening of an incident and the issue being resolved
 */

/**
 * @swagger
 *  tags:
 *      name: Metrics
 *      description: Endpoint to retrieve the calculated DORA metrics
 */

/**
 * @swagger
 * /metrics:
 *  get:
 *      summary: Get the DORA metrics of the past 7 days
 *      tags: [Metrics]
 *      parameters:
 *        - in: query
 *          name: time-range
 *          schema:
 *            type: string
 *          description: time range to take into account
 *          default: 1w
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Metrics'
 */
router.get("/metrics", async (req, res) => {
  try {
    const timeRange = req.query["time-range"];
    joi.assert(
      timeRange,
      joi.string().pattern(/(\d+(mo|[dwy]))+/, { name: "duration" })
    );

    const metrics = {
      deploymentFrequency: await deploymentFrequency(timeRange),
      leadTime: await leadTime(timeRange),
      changeFailRate: await changeFailRate(timeRange),
      timeToRecovery: await timeToRecovery(timeRange),
    };
    res.status(200).json(metrics);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.annotate(true));
    }
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
