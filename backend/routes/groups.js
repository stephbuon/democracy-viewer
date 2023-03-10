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
        const result = await control.sendInvite(req.models, req.user.username, req.body.username, req.body.private_group);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to send private group invite:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to accept a private group invite
router.post('/invite/accept', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addMember(req.models.groups, req.body.private_group, req.user.username, req.body.rank);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to accept private group invite:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to edit a private group
router.put('/:group', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.editGroup(req.models.groups, req.user.username, req.params.group, req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to edit private group:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to edit a private group member
router.put('/:group/member/:member', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.editMember(req.models.groups, req.user.username, req.params.group, req.params.member, req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to edit private group member:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the info about a private group
router.get('/id/:group', async(req, res, next) => {
    try {
        const result = await req.models.groups.getGroupById(req.params.group);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private group by id:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to all groups with a name like the given name
router.get('/search', async(req, res, next) => {
    try {
        const result = await req.models.groups.getGroupsByName(req.query.search);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private group by search:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the private groups a user is in
router.get('/user', authenticateJWT, async(req, res, next) => {
    try {
        const result = await req.models.groups.getGroupsByUser(req.user.username);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private groups by user:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the members of a private group
router.get('/members/:group', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getGroupMembers(req.models.groups, req.user.username, req.params.group);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private group members:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get a group member record
router.get('/:group/member/:member', async(req, res, next) => {
    try {
        const result = await req.models.groups.getMember(req.params.member, req.params.group);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private group member:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a private group
router.delete('/:group', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteGroup(req.models.groups, req.user.username, req.params.group);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete private group:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a private group member
router.delete('/:group/member/:member', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteGroupMember(req.models.groups, req.user.username, req.params.member, req.params.group);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete private group member:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a private group member
router.delete('/invite/:group/member/:member', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteGroupInvite(req.models.groups, req.user.username, req.params.member, req.params.group);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete private group invite:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;
