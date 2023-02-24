const express = require('express');
const router = express.Router();
const control = require("../controllers/datasets");
const { authenticateJWT, optAuthenticateJWT } = require("../middleware/authentication");
const util = require("../util/file_management");

// Route to create a dataset
router.post('/', authenticateJWT, async(req, res, next) => {
    try {
        // Upload file to server
        await util.uploadFile(req, res);

        if (!req.file) {
            // If file failed to upload, throw error
            res.status(400).json({ message: "No uploaded file" });
        } else {
            // Create dataset in database from file
            console.log(req.file.path);
            const result = await control.createDataset(req.models.datasets, req.file.path);
            res.status(201).json(result);
        }
        
    } catch (err) {
        console.error('Failed to create dataset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to add dataset metadata
router.post('/metadata', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.createMetadata(req.models.datasets, req.user.username, req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create dataset metadata:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to add a tag for a dataset
router.post('/tag', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addTag(req.models.datasets, req.user.username, req.body.dataset, req.body.tag);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add dataset tag:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to change the type of dataset column
router.put('/:table', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.changeColType(req.models.datasets, req.params.table, req.body.column, req.body.type);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update dataset column type:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to change dataset metadata
router.put('/metadata/:table', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.updateMetadata(req.models.datasets, req.user.username, req.params.table, req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update dataset metadata:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to increment a dataset's clicks
router.put('/click/:table', async(req, res, next) => {
    try {
        const result = await req.models.datasets.incClicks(req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to click on dataset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get dataset metadata
router.get('/metadata/:table', async(req, res, next) => {
    try {
        const result = await req.models.datasets.getMetadata(req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get dataset metadata:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get all records in a table
router.get('/records/:table', async(req, res, next) => {
    try {
        const result = await req.models.datasets.getDataset(req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get dataset records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get all unique tags
router.get('/tags/unique', async(req, res, next) => {
    try {
        const results = await control.getUniqueTags(req.models.datasets);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get unique tags:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get all tags for a dataset
router.get('/tags/dataset/:table', async(req, res, next) => {
    try {
        const results = await control.getTags(req.models.datasets, req.params.table);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get dataset tags:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to filter datasets
router.get('/filter', optAuthenticateJWT, async(req, res, next) => {
    try {
        let results;
        if (req.user) {
            results = await req.models.datasets.getFilteredDatasets(req.query, req.user.username);
        } else {
            results = await req.models.datasets.getFilteredDatasets(req.query, undefined);
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get filtered datasets:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to subset a dataset
router.get('/subset/:table', async(req, res, next) => {
    try {
        const results = await req.models.datasets.subsetTable(req.params.table, req.query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get dataset subset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to download a csv of a full dataset
router.get('/download/:table', async(req, res, next) => {
    try {
        // Generate file
        const result = await control.downloadDataset(req.models.datasets, req.params.table);
        // Download file
        res.download(result, `${ req.params.table }.csv`, (err) => {
            // Error handling
            if (err) {
                console.error("Failed to download dataset:", err);
                res.status(500).json({ message: err.toString() });
                next();
            }
        });
    } catch (err) {
        console.error('Failed to download dataset:', err);
        res.status(500).json({ message: err.toString() });
        next();
    }
});

// Route to download a subset of a dataset
router.get('/download/subset/:table', async(req, res, next) => {
    try {
        // Generate file
        const result = await control.downloadSubset(req.models.datasets, req.params.table, req.query);
        // Download file
        res.download(result, `${ req.params.table }.csv`, (err) => {
            // Error handling
            if (err) {
                console.error("Failed to download dataset subset:", err);
                res.status(500).json({ message: err.toString() });
                next();
            }
        });
    } catch (err) {
        console.error('Failed to get dataset subset:', err);
        res.status(500).json({ message: err.toString() });
        next();
    }
});

// Route to delete a datset and its metadata
router.delete('/:table', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.deleteDataset(req.models.datasets, req.user.username, req.params.table);
        res.status(204).json(result);
    } catch (err) {
        console.error('Failed to get dataset records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete the given tag on the given dataset
router.delete('/:table/tags/:tag', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.deleteTag(req.models.datasets, req.user.username, req.params.table, req.params.tag);
        res.status(204).json(result);
    } catch (err) {
        console.error('Failed to delete tag:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;