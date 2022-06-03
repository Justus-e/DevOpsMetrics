const express = require('express');
const router = express.Router();
const influx = require('../influx')

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
 *                      description: type of event ('deployment', 'change', 'incident', 'restore')
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
router.post('/events', async (req, res) => {
    try {
        const {eventType} = req.body;
        switch (eventType) {
            case "deployment":
                influx.writeEvent('deployment');
                break;
            case "change":
                influx.writeEvent('change');
                break;
            case "incident":
                influx.writeEvent('incident');
                break;
            case "restore":
                influx.writeEvent('restore');
                break;
            default:
                res.status(400).send('unknown eventType')
        }
        res.status(200).send("Event added!");
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
