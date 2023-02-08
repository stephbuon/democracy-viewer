const express = require('express');
const router = express.Router();
const control = require("../controllers/users");

// Route to create a new user
router.post('/', async(req, res, next) => {
    try {
        const result = await control.createUser(req.models.users, req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;