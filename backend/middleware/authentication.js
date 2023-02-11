const jwt = require("jsonwebtoken");
require('dotenv').config();

const accessTokenSecret = process.env.TOKEN_SECRET;

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.sendStatus(401);
    }
  
    const token = authHeader.split(" ")[1];
    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
  
      req.user = user;
      next();
    });
};

module.exports = {
  authenticateJWT
};