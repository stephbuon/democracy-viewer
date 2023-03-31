const express = require('express');
const router = express.Router();
const control = require("../controllers/preprocessing");
const { authenticateJWT } = require("../middleware/authentication");

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

module.exports = router;