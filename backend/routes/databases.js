const express = require('express');
const router = express.Router();
const control = require("../controllers/databases");
const { authenticateJWT, optAuthenticateJWT } = require("../middleware/authentication");

// Route to create a new database connection
router.post('/', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.newConnection(
            req.models.databases, req.body.name, req.user.username, 
            req.body.is_public, req.body.host, req.body.port, req.body.database, 
            req.body.username, req.body.password, req.body.client
        );
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create external connection:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;