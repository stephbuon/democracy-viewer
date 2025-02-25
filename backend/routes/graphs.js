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

// Route update graph metadata
router.put('/metadata/:id', async(req, res, next) => {
    try {
        const result = await control.updateMetadata(req.knex, req.params.id, req.body, req.user);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update metadata:', err);
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

// Route to filter graphs
router.get('/filter/:page', async(req, res, next) => {
    try {
        let results;
        if (req.user) {
            results = await control.getFilteredGraphs(req.knex, req.query, req.user.email, req.params.page);
        } else {
            results = await control.getFilteredGraphs(req.knex, req.query, undefined, req.params.page);
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get filtered graphs:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get number of graph filter results
router.get('/count/filter', async(req, res, next) => {
    try {
        let result;
        if (req.user) {
            result = await control.getFilteredGraphsCount(req.knex, req.query, req.user.email);
        } else {
            result = await control.getFilteredGraphsCount(req.knex, req.query, undefined);
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get filtered graphs count:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get a graph from a graph id
router.get('/id/:id', async(req, res, next) => {
    try {
        const result = await control.getGraphSettings(req.knex, req.params.id, req.user);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get graph by id:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get a signed url to download a graph image
router.get('/image/:id', async(req, res, next) => {
    try {
        const result = await control.getGraphImage(req.knex, req.params.id, req.user);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to download graph image:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a graph
router.delete('/:id', async(req, res, next) => {
    try {
        await control.deleteGraph(req.knex, req.params.id, req.user);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete graph:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;