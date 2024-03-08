const jwt = require("jsonwebtoken");
require('dotenv').config();

const accessTokenSecret = process.env.TOKEN_SECRET;

// Required token authentication
const authenticateJWT = (req, res, next) => {
  try {
    // Commented as the optional authentication is now applied to all requests
    // const authHeader = req.headers.authorization;
    // if (!authHeader) {
    //   return res.sendStatus(401);
    // }
  
    // const token = authHeader.split(" ")[1];
    // jwt.verify(token, accessTokenSecret, (err, user) => {
    //   if (err) {
    //     return res.sendStatus(403);
    //   }
  
    //   req.user = user;
    //   next();
    // });

    // Check if user has been authenticated
    if (req.user) {
      next();
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    console.error("Failed to authenticate user token", err);
    res.status(500).json({message: err.toString()});
  }
};

// Optional token authentication
const optAuthenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, accessTokenSecret, (err, user) => {
        if (user) {
          req.user = user;
        }
      });
    }
  
    next();
  } catch (err) {
    console.error("Failed to authenticate user token", err);
    res.status(500).json({message: err.toString()});
  }
};

module.exports = {
  authenticateJWT,
  optAuthenticateJWT
};