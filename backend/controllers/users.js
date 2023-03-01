const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
require('dotenv').config();

const accessTokenSecret = process.env.TOKEN_SECRET;

// Authenticate a user
const authenticateUser = async (user, body) => {
    const username = body.username;
    const curr = await user.authenticateUser(username, body.password);
    if (curr === false) {
        return null;
    }
    const user_ = await findUserByUsername(user, username);
    const accessToken = jwt.sign({ ...user_ }, accessTokenSecret);

    return accessToken;
}

// Create a new user
const createUser = async (user, body) => {
    // Hash the password and send to model
    body.password = bcrypt.hashSync(body.password, 10);
    const result = await user.createNewUser(body);
    delete result.password;
    return result;
}

// Get a user by their username
const findUserByUsername = async(user, username) => {
    const user_ = await user.findUserByUsername(username);
    // Delete the user's password
    delete user_.password;
    return user_;
}

// Update a user's information
const updateUser = async(user, username, params) => {
    // Get the current metadata for this table
    const curr = await user.findUserByUsername(username);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== username) {
        throw new Error("Logged in user does not match selecter user");
    }

    // Update user record
    const result = await user.updateUser(username, params);
    return result;
}

// Delete a user
const deleteUser = async(user, username) => {
    // Get the current metadata for this table
    const curr = await user.findUserByUsername(username);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== username) {
        throw new Error("Logged in user does not match selecter user");
    }

    // Update user record
    const result = await user.deleteUser(username);
    return result;
}

module.exports = {
    authenticateUser,
    createUser,
    findUserByUsername,
    updateUser,
    deleteUser
};