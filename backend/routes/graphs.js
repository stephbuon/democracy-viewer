const express = require('express');
const router = express.Router();
const { authenticateJWT } = require("../middleware/authentication");
const control = require("../controllers/graphs");

// Route to initiate the upload of a graph
router.post('/publish', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.publishGraph(req.knex, req.body.settings, req.user);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to publish graph:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to upload graph metadata
router.post('/metadata', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addMetadata(req.knex, req.body, req.user);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add graph metadata:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

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