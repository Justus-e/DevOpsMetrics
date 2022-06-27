import { Router } from "express";
import deploymentFrequency from "../metrics/deploymentFrequency";
import leadTime from "../metrics/leadTime";

const router = Router();

/** Metrics MODEL
 * @swagger
 *  components:
 *      schemas:
 *          Metrics:
 *              type: object
 *              properties:
 *                  deploymentFrequency:
 *                      type: number
 *                      description: The mean daily amount of deployments in the past 7 days
 *                  leadTime:
 *                      type: number
 *                      description: The mean amount of seconds passed between first commit and finished deployment of a code change in the past 7 days
 *                  changeFailRate:
 *                      type: number
 *                      description: Percentage of deployments that caused an incident in the past 7 days
 *                  timeToRecovery:
 *                      type: number
 *                      description: The mean amount of seconds passed between the happening of an incident and the issue being resolved in the past 7 days
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
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Metrics'
 */
router.get("/metrics", async (_req, res) => {
  try {
    const metrics = {
      deploymentFrequency: await deploymentFrequency(),
      leadTime: await leadTime(),
      changeFailRate: 0,
      timeToRecovery: 0,
    };
    res.status(200).json(metrics);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
