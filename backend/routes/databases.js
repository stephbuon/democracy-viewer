const express = require('express');
const router = express.Router();
const control = require("../controllers/databases");
const { authenticateJWT } = require("../middleware/authentication");

// Route to create a new database connection
router.post('/', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.newConnection(
            req.knex, req.body.name, req.user.username, 
            req.body.host, req.body.port, req.body.database, 
            req.body.username, req.body.password, req.body.client
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

// Route to download schema template by client
router.get('/download/template/:client', async(req, res, next) => {
    try {
        // Download file
        res.download(`./db/schema_templates/${ req.params.client }.sql`, (err) => {
            // Error handling
            if (err) {
                console.log("Failed to download starter schema:", err);
                res.status(500).json({ message: err.toString() });
                next();
            }
        });
    } catch (err) {
        console.error('Failed to get connections by user:', err);
        res.status(500).json({ message: err.toString() });
        next();
    }
});

module.exports = router;