const express = require('express');
const router = express.Router();
const control = require("../controllers/preprocessing");
const { authenticateJWT } = require("../middleware/authentication");
const util = require("../util/file_management");

// Begin preprocessing
router.post('/:table', async(req, res, next) => {
    try {
        const result = await control.beginPreprocessing(req.models.datasets, req.params.table);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add split text records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Add split text records
router.post('/split/:table', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addSplitRecords(req.models, req.params.table, req.body, req.user.username);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add split text records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to upload a split text file
router.post('/split/:table/upload', authenticateJWT, async(req, res, next) => {
    try {
        // Upload file to server
        await util.uploadFile(req, res);

        if (!req.file) {
            // If file failed to upload, throw error
            res.status(400).json({ message: "No uploaded file" });
        } else {
            // Create dataset in database from file
            console.log(req.file.path);
            const result = await control.uploadSplitRecords(req.models, req.params.table, req.file.path, req.user.username)
            res.status(201).json(result);
        }
    } catch (err) {
        console.error('Failed to upload split text records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the number of split text records in a table
router.get('/split/:table/count', async(req, res, next) => {
    try {
        const result = await req.models.preprocessing.getSplitsCount(req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get split text records count:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete split text records in a table
router.delete('/split/:table', async(req, res, next) => {
    try {
        const metadata = await req.models.datasets.updateMetadata(req.params.table, { processed: false });
        await req.models.preprocessing.deleteSplitRecords(req.params.table);
        res.status(204).json(metadata);
    } catch (err) {
        console.error('Failed to delete split text records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Add word embedding records
router.post('/embeddings/:table', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addEmbeddingRecords(req.models.preprocessing, req.params.table, req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add word embeddings records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to upload a word embeddings file
router.post('/embeddings/:table/upload', authenticateJWT, async(req, res, next) => {
    try {
        // Upload file to server
        await util.uploadFile(req, res);

        if (!req.file) {
            // If file failed to upload, throw error
            res.status(400).json({ message: "No uploaded file" });
        } else {
            // Create dataset in database from file
            console.log(req.file.path);
            const result = await control.upl(req.models, req.params.table, req.file.path, req.user.username)
            res.status(201).json(result);
        }
    } catch (err) {
        console.error('Failed to upload word embedding records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the number of word embedding records in a table
router.get('/embeddings/:table/count', async(req, res, next) => {
    try {
        const result = await req.models.preprocessing.getEmbeddingsCount(req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get word embeddings records count:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete word embedding records in a table
router.delete('/split/:table', async(req, res, next) => {
    try {
        const metadata = await req.models.datasets.updateMetadata(req.params.table, { processed: false });
        await req.models.preprocessing.deleteEmbeddingRecords(req.params.table);
        res.status(204).json(metadata);
    } catch (err) {
        console.error('Failed to delete word embedding records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;