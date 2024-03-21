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

module.exports = router;