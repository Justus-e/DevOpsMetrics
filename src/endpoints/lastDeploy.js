const express = require("express");
const router = express.Router();
const influx = require("../influx");

/** lastDeploy MODEL
 * @swagger
 *  components:
 *      schemas:
 *          lastDeploy:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                  description: sha of deployment commit
 *                timestamp:
 *                  type: string
 *                  description: timestamp of the deployment
 *
 */

/**
 * @swagger
 *  tags:
 *      name: Last Deploy
 *      description: Endpoint to retrieve the last Deployment to prod
 */

/**
 * @swagger
 * /last-deployment:
 *  get:
 *      summary: Get the Details for the last successful deployment
 *      tags: [Last Deploy]
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/lastDeploy'
 *          404:
 *              description: no deployment recorded yet
 */
router.get("/last-deployment", async (_req, res) => {
  try {
    const result = await influx.queryLastDeployEvent();
    if (result.length === 1) {
      const lastDeploy = {
        id: result[0]._value,
        timestamp: result[0]._time,
      };
      res.status(200).json(lastDeploy);
    } else {
      res.status(404).send("no deployment recorded yet");
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
