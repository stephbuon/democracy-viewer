const bcrypt = require("bcrypt");
const knex = require("../db/knex");
const table = "users";

class users {
    // Insert new user into DB
    async createNewUser(body) {
        const insert = await knex(table).insert({ ...body });
        const result = await this.findUserByUsername(body.username);
        return result;
    }

    // Return the user with the given username
    async findUserByUsername(username) {
        let result = await knex(table).where({ username });
        result = result[0];
        return result;
    }

    // Authenticate user credentials
    async authenticateUser(username, password) {
        // Get user info
        const user = await this.findUserByUsername(username);
        // If user not found, return false
        if (!user) {
            console.error(`No users matched the username ${username}`);
            return false;
        }
        // Extract first value from users
        // Compare given password to hashed password in DB
        const isValid = await bcrypt.compare(password, user.password);
        // Return if password is a match or not
        return isValid;
    }
}

module.exports = users;