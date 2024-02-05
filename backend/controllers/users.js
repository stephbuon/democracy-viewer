const bcrypt = require("bcryptjs");

const dataset = require("../models/datasets");
const users = require("../models/users");

// Create a new user
const createUser = async (knex, body) => {
    const model = new users(knex);

    // Hash the password and send to model
    body.password = bcrypt.hashSync(body.password, 10);
    const result = await model.createNewUser(body);
    delete result.password;
    return result;
}

// Get a user by their username
const findUserByUsername = async(knex, username) => {
    const model = new users(knex);

    const user_ = await model.findUserByUsername(username);
    // Delete the user's password
    delete user_.password;
    return user_;
}

// Update a user's information
const updateUser = async(knex, username, params) => {
    const model = new users(knex);

    // Update user record
    await model.updateUser(username, params);
    const result = await findUserByUsername(knex, username);
    return result;
}

// Delete a user
const deleteUser = async(knex, user) => {
    const datasetController = require("../controllers/datasets");
    const model_users = new users(knex);
    const model_datasets = new dataset(knex);

    // Get this user's datasets
    const datasets = await model_datasets.getUserDatasets(user);
    // For each dataset, call delete function
    for (let i = 0; i < datasets.length; i++) {
        await datasetController.deleteDataset(knex, user, datasets[i].table_name)
    }
    
    // Update user record
    const result = await model_users.deleteUser(user);
    return result;
}

module.exports = {
    createUser,
    findUserByUsername,
    updateUser,
    deleteUser
};