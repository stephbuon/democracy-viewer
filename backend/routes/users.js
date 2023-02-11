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

// Route to update user
router.put('/:username', async(req, res, next) => {
    try {
        const result = await control.updateUser(req.models.users, req.params.username, req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a user
router.delete('/:username', async(req, res, next) => {
    try {
        const result = await control.deleteUser(req.models.users, req.params.username);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;