const express = require('express');
const router = express.Router();

let temp;

//TODO: Add swagger doku
router.post('/github-hook', async (req, res) => {
    try {
        temp = req.body;
        console.log(temp)
        res.sendStatus(200)
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

router.get('/github-hook', async (_req, res) => {
    try {
        res.status(200).json(temp)
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
