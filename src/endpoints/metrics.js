const express = require("express");
const router = express.Router();
const deploymentFrequency = require("../metrics/deploymentFrequency");
const leadTime = require("../metrics/leadTime");
const changeFailRate = require("../metrics/changeFailRate");
const timeToRecovery = require("../metrics/timeToRecover");
const joi = require("joi");

/** HistoricData MODEL
 * @swagger
 *  components:
 *      schemas:
 *          HistoricData:
 *              type: object
 *              properties:
 *                  deploymentFrequency:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          time:
 *                            type: date
 *                            description: timestamp for the data
 *                          value:
 *                            type: number
 *                            description: The mean amount of seconds passed between two deployments
 *                  leadTime:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          time:
 *                            type: date
 *                            description: timestamp for the data
 *                          value:
 *                            type: number
 *                            description: The mean amount of seconds passed between first commit and finished deployment of a code change
 *                  changeFailRate:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          time:
 *                            type: date
 *                            description: timestamp for the data
 *                          value:
 *                            type: number
 *                            description: Percentage of deployments that caused an incident(between 0 and 1)
 *                  timeToRecovery:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          time:
 *                            type: date
 *                            description: timestamp for the data
 *                          value:
 *                            type: number
 *                            description: The mean amount of seconds passed between the happening of an incident and the issue being resolved
 */

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
 *                  historicData:
 *                      $ref: '#/components/schemas/HistoricData'
 *
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
 *        - in: query
 *          name: include-historic
 *          schema:
 *            type: boolean
 *          description: whether to include time series Data for each metric
 *          default: false
 *        - in: query
 *          name: aggregate-interval
 *          schema:
 *            type: string
 *          description: interval in which the data-points are being aggregated to one point.
 *          default: 1d
 *        - in: query
 *          name: create-empty
 *          schema:
 *            type: boolean
 *          description: whether to create a data-point for each intervall, even if there is no data
 *          default: false
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
    const timeRange = req.query["time-range"] || "1w";
    const includeHistoricData = req.query["include-historic"] || "false";
    const aggregateInterval = req.query["aggregate-interval"] || "1d";
    const createEmpty = req.query["create-empty"] || "false";
    joi.assert(
      timeRange,
      joi.string().pattern(/(\d+(mo|[dwy]))+/, { name: "duration" })
    );
    joi.assert(createEmpty, joi.string().valid("true", "false"));
    joi.assert(
      aggregateInterval,
      joi.string().pattern(/(\d+(mo|[dwy]))+/, { name: "duration" })
    );
    joi.assert(includeHistoricData, joi.string().valid("true", "false"));

    let metrics = {
      deploymentFrequency: await deploymentFrequency.getMetric(timeRange),
      leadTime: await leadTime.getMetric(timeRange),
      changeFailRate: await changeFailRate.getMetric(timeRange),
      timeToRecovery: await timeToRecovery.getMetric(timeRange),
    };

    if (includeHistoricData === "true") {
      metrics.historicData = {
        deploymentFrequency: await deploymentFrequency.getMetricOverTime(
          timeRange,
          aggregateInterval,
          createEmpty === "true"
        ),
        leadTime: await leadTime.getMetricOverTime(
          timeRange,
          aggregateInterval,
          createEmpty === "true"
        ),
        changeFailRate: await changeFailRate.getMetricOverTime(
          timeRange,
          aggregateInterval
        ),
        timeToRecovery: await timeToRecovery.getMetricOverTime(
          timeRange,
          aggregateInterval,
          createEmpty === "true"
        ),
      };
    }

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
