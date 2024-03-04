const bcrypt = require("bcryptjs");
const table = "users";

class users {
    constructor(knex) {
        if (!knex) {
            throw new Error("Database connection not defined");
        }
        this.knex = knex;
    }

    // Insert new user into DB
    async createNewUser(body) {
        const insert = await this.knex(table).insert({ ...body });
        const result = await this.findUserByUsername(body.username);
        return result;
    }

    // Return the user with the given username
    async findUserByUsername(username) {
        let result = await this.knex(table).where({ username });
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

    // Update a user record
    async updateUser(username, params) {
        const update = await this.knex(table).where({ username }).update({ ...params });
        const record = await this.knex(table).where({ username });
        return record[0];
    }

    // Delete a user record
    async deleteUser(username) {
        const del = await this.knex(table).where({ username }).delete();
        return del;
    }
}

module.exports = users;