const express = require('express');
const router = express.Router();
const control = require("../controllers/users");
const { authenticateJWT } = require("../middleware/authentication");

// Route to create a new user
router.post('/', async(req, res, next) => {
    try {
        const result = await control.createUser(req.knex, req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to create password reset code
router.post('/reset/:email', async(req, res, next) => {
    try {
        await control.createResetCode(req.knex, req.params.email)
        res.status(201).end();
    } catch (err) {
        console.error('Failed to create account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get a user by their email
router.get('/:email', async(req, res, next) => {
    try {
        const result = await control.findUserByEmail(req.knex, req.params.email)
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to verify a password reset code
router.get('/reset/verify/:email', async(req, res, next) => {
    try {
        await control.verifyResetCode(req.knex, req.params.email, req.query.code)
        res.status(200).end();
    } catch (err) {
        console.error('Failed to verify password reset code:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to update user
router.put('/:email', authenticateJWT, async(req, res, next) => {
    try {
        if (req.params.email !== req.user.email) {
            throw new Error(`${ req.user.email } cannot update the account ${ req.params.email }`);
        }
        const result = await control.updateUser(req.knex, req.params.email, req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to reset a password
router.put('/reset/:email', async(req, res, next) => {
    try {
        await control.resetPassword(req.knex, req.params.email, req.body.password, req.body.code);
        res.status(200).end();
    } catch (err) {
        console.error('Failed to update account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a user
router.delete('/', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteUser(req.knex, req.user.email);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete account:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;