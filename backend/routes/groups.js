const express = require('express');
const router = express.Router();
const control = require("../controllers/groups");
const { authenticateJWT } = require("../middleware/authentication");

// Route to create a private group
router.post('/', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addGroup(req.knex, req.user.email, req.body);
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
        const result = await control.sendInvite(req.knex, req.user.email, req.body.email, req.body.private_group);
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
        const result = await control.addMember(req.knex, req.body.private_group, req.user.email, req.body.code);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to accept private group invite:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to add a dataset to a group
router.post('/dataset', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addDataset(req.knex, req.body.private_group, req.body.table_name, req.user.email);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add dataset to group:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to edit a private group
router.put('/:group', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.editGroup(req.knex, req.user.email, req.params.group, req.body);
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
        const result = await control.editMember(req.knex, req.user.email, req.params.group, req.params.member, req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to edit private group member:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the info about a private group
router.get('/id/:group', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getGroupById(req.knex, req.params.group);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private group by id:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the private groups a user is in
router.get('/user', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getGroupsByUser(req.knex, req.user.email);
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
        const result = await control.getGroupMembers(req.knex, req.user.email, req.params.group);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private group members:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get a group member record
router.get('/:group/member/:member', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getMember(req.knex, req.params.member, req.params.group);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get private group member:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get group records
router.get('/filter/results/:page', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getFilteredGroups(req.knex, req.query, req.user.email, true, req.params.page);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get filtered groups:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get group count
router.get('/filter/count', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getFilteredGroupCount(req.knex, req.query, req.user.email);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get filtered groups count:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a private group
router.delete('/:group', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteGroup(req.knex, req.user.email, req.params.group);
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
        await control.deleteGroupMember(req.knex, req.user.email, req.params.member, req.params.group);
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
        await control.deleteGroupInvite(req.knex, req.user.email, req.params.member, req.params.group);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete private group invite:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a dataset from a group
router.delete('/:private_group/dataset/:table_name', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteDataset(req.knex, req.user.email, req.params.private_group, req.params.table_name);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete dataset from group:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;
