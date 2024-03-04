const jwt = require('jsonwebtoken');
require('dotenv').config();

const users = require("../models/users");

const accessTokenSecret = process.env.TOKEN_SECRET;

// Authenticate a user
const authenticateUser = async(knex, body) => {
    const model = new users(knex)

    const username = body.username;
    const curr = await model.authenticateUser(username, body.password);
    if (curr === false) {
        return null;
    }
    const user_ = await model.findUserByUsername(username);
    const accessToken = jwt.sign({ ...user_ }, accessTokenSecret);

    return accessToken;
}

// Update an authentication token with a database connection id
const updateToken = (user, database) => {
    if (!database) {
        throw new Error("Missing database connection id");
      }
  
      const user_ = { ...user };
      user_.database = database;
      const accessToken = jwt.sign({ ...user_ }, accessTokenSecret);

      return accessToken;
}

module.exports = {
    authenticateUser,
    updateToken
}