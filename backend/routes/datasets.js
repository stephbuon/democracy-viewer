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

// Route to change the type of dataset column
router.put('/:table', async(req, res, next) => {
    try {
        const result = await control.changeColType(req.models.datasets, req.params.table, req.body.column, req.body.type);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update dataset column type:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;