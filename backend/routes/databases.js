const express = require('express');
const router = express.Router();
const control = require("../controllers/databases");
const { authenticateJWT } = require("../middleware/authentication");

// Route to create a new database connection
router.post('/:name', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.newConnection(
            req.knex, req.params.name, req.user.username, req.body
        );
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create external connection:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get connections by user
router.get('/', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getConnectionsByUser(req.knex, req.user.username);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get connections by user:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;