const bcrypt = require("bcryptjs");
const chance = require("chance").Chance();
const runPython = require("../util/python_config");

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

// Create a password reset code
const createResetCode = async(knex, email) => {
    const model = new users(knex);

    // Generate code
    const code = chance.string({ length: 8, casing: 'upper', alpha: true, numeric: true });
    // Hash generated code
    const hashedCode = bcrypt.hashSync(code, 10)
    // Delete old code
    await model.deleteResetCode(email);
    // Add new code
    await model.addResetCode(email, hashedCode);
    // Send email to user
    await runPython("send_email.py", [email, "reset", code]);
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

// Verify if a password reset code matches
const verifyResetCode = async(knex, email, code) => {
    const model = new users(knex);

    // Delete expired codes
    await model.deleteOldResetCodes();
    // Get code for email (will throw error if not found)
    const storedCode = await model.getResetCode(email);
    // Compare codes and return if they match or not
    const result = await bcrypt.compare(code, storedCode.code);
    if (result) {
        await model.useCode(email);
    } else {
        throw new Error(`No active reset token for the email ${ email }`);
    }
}

// Get a user's formatted name
const getName = async(knex, email) => {
    const model = new users(knex);

    const record = await model.findUserByEmail(email);
    let name = `${ record.first_name } ${ record.last_name }`;
    if (record.title) {
        name = `${ record.title } ${ name }`;
    }
    if (record.suffix) {
        name = `${ name } ${ record.suffix }`;
    }

    return name;
}

// Update a user's information
const updateUser = async(knex, email, params) => {
    const model = new users(knex);

    // Delete password from params
    delete params.password;
    // Update user record
    await model.updateUser(email, params);
    const result = await findUserByEmail(knex, email);
    return result;
}

// Reset a user's password
const resetPassword = async(knex, email, rawPassword, code) => {
    const model = new users(knex);

    // Check to make sure the token has been used
    const storedCode = await model.getResetCode(email);
    const result = await bcrypt.compare(code, storedCode.code);
    if (result && storedCode.used) {
        // Hash the new password
        const password = bcrypt.hashSync(rawPassword, 10);
        // Update password in database
        await model.updateUser(email, { password });
        // Delete code
        await model.deleteResetCode(email);
    } else {
        throw new Error("Invalid code")
    }
}

// Delete a user
const deleteUser = async(knex, user) => {
    const datasetController = require("../controllers/datasets");
    const model_users = new users(knex);
    const model_datasets = new dataset(knex);

    // Get this user's datasets
    const datasets = await model_datasets.getFilteredDatasets({ user }, user, false);
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
    createResetCode,
    findUserByEmail,
    verifyResetCode,
    getName,
    updateUser,
    resetPassword,
    deleteUser
};