const express = require("express");
const router = express.Router();

const control = require("../controllers/session");
const { authenticateJWT } = require("../middleware/authentication");

// Route to create a session and get access token
router.post('/', async (req, res, next) => {
  try {
      const result = await control.authenticateUser(req.knex, req.body);
      if (result === null) {
        res.status(401).json({message: "Invalid credentials"});
      } else {
        res.status(201).json(result);
      }
  } catch (err) {
      console.error('Failed to log in:', err);
      res.status(500).json({ message: err.toString() });
  }
  next();
});
  
// Route to get user data from token
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.error("Failed to get session:", err);
    res.status(500).json({message: err.toString()});
  }
  next();
});

// Route to update a session with a database connection
router.put('/database/add', authenticateJWT, async(req, res, next) => {
  try {
    const result = control.addConnectionToToken(req.user, req.body.database);
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to update token:", err);
    res.status(500).json({message: err.toString()});
  }
  next();
});

// Route to update a session without a database connection
router.put('/database/remove', authenticateJWT, async(req, res, next) => {
  try {
    const result = control.removeConnectionFromToken(req.user);
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to update token:", err);
    res.status(500).json({message: err.toString()});
  }
  next();
});
  
module.exports = router;