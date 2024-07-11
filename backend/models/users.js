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
        const result = await this.findUserByEmail(body.email);
        return result;
    }

    // Return the user with the given email
    async findUserByEmail(email) {
        let result = await this.knex(table).where({ email });
        result = result[0];
        return result;
    }

    // Authenticate user credentials
    async authenticateUser(email, password) {
        // Get user info
        const user = await this.findUserByEmail(email);
        // If user not found, return false
        if (!user) {
            console.error(`No users matched the email ${email}`);
            return false;
        }
        // Extract first value from users
        // Compare given password to hashed password in DB
        const isValid = await bcrypt.compare(password, user.password);
        // Return if password is a match or not
        return isValid;
    }

    // Update a user record
    async updateUser(email, params) {
        const update = await this.knex(table).where({ email }).update({ ...params });
        const record = await this.knex(table).where({ email });
        return record[0];
    }

    // Delete a user record
    async deleteUser(email) {
        const del = await this.knex(table).where({ email }).delete();
        return del;
    }
}

module.exports = users;