const express = require('express');
const router = express.Router();
const control = require("../controllers/datasets");

// Route to create a dataset
router.post('/', async(req, res, next) => {
    try {
        const result = await control.createDataset(req.models.datasets, req.body.path);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create dataset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;