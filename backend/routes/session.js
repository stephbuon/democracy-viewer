const express = require("express");
const router = express.Router();

const control = require("../controllers/user");
const auth = require("../middleware/authentication");

// Route to create a session and get access token
router.post('/', async (req, res, next) => {
  try {
      const result = await control.authenticateUser(req.models.user, req.body);
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
router.get('/', auth.authenticateJWT, async (req, res, next) => {
  try {
    const username = req.user.username;
    const result = await control.findUserByUsername(req.models.user, username);
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to get session:", err);
    res.status(500).json({message: err.toString()});
  }
  next();
});
  
module.exports = router;