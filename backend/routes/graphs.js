const express = require('express');
const router = express.Router();
const control = require("../controllers/graphs");

// Route to get the data to generate a given graph
router.get('/:dataset', async(req, res, next) => {
    try {
        let result;
        if (req.user) {
            result = await control.createGraph(req.knex, req.params.dataset, req.query, req.user);
        } else {
            result = await control.createGraph(req.knex, req.params.dataset, req.query);
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to generate graph:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the data to generate a given graph
router.get('/zoom/ids/:dataset', async(req, res, next) => {
    try {
        let result;
        if (req.user) {
            result = await control.getZoomIds(req.knex, req.params.dataset, req.query, req.user);
        } else {
            result = await control.getZoomIds(req.knex, req.params.dataset, req.query);
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get graph zoom ids:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get paginated records from a graph zoom
router.get('/zoom/records/:dataset', async(req, res, next) => {
    try {
        let result;
        if (req.user) {
            result = await control.getZoomRecords(req.knex, req.params.dataset, req.query, req.user)
        } else {
            result = await control.getZoomRecords(req.knex, req.params.dataset, req.query);
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get graph zoom records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;