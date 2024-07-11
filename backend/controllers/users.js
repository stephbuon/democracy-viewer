const bcrypt = require("bcryptjs");

const dataset = require("../models/datasets");
const users = require("../models/users");

// Create a new user
const createUser = async(knex, body) => {
    const model = new users(knex);

    // Hash the password and send to model
    body.password = bcrypt.hashSync(body.password, 10);
    const result = await model.createNewUser(body);
    delete result.password;
    return result;
}

// Get a user by their email
const findUserByEmail = async(knex, email) => {
    const model = new users(knex);

    const user_ = await model.findUserByEmail(email);
    if (user_) {
        // Delete the user's password
        delete user_.password;
        return user_;
    } else {
        // Return null if user doesn't exist
        return null;
    }
}

// Update a user's information
const updateUser = async(knex, email, params) => {
    const model = new users(knex);

    // Hash password if changed
    if (params.password) {
        params.password = bcrypt.hashSync(params.password, 10);
    }
    // Update user record
    await model.updateUser(email, params);
    const result = await findUserByEmail(knex, email);
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
    findUserByEmail,
    updateUser,
    deleteUser
};