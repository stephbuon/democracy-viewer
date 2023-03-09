const express = require('express');
const router = express.Router();
const control = require("../controllers/groups");
const { authenticateJWT } = require("../middleware/authentication");

// Route to create a private group
router.post('/', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addGroup(req.models.groups, req.user.username, req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create private group:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to send an invite to a user to join a private group
router.post('/invite', authenticateJWT, async(req, res, next) => {
    try {
        const result = await req.models.groups.addGroup(req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create private group:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to accept a private group invite
router.post('/invite', authenticateJWT, async(req, res, next) => {
    try {
        const result = await req.models.groups.addGroup(req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create private group:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;
