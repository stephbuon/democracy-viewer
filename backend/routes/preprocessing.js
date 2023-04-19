const express = require('express');
const router = express.Router();
const control = require("../controllers/preprocessing");
const { authenticateJWT } = require("../middleware/authentication");

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
        const result = await control.addSplitRecords(req.models.preprocessing, req.params.table, req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add split text records:', err);
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

module.exports = router;