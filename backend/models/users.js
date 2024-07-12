const bcrypt = require("bcryptjs");
const table = "users";
const password_reset_table = "password_reset_codes";
const { DateTime } = require("luxon");

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

    // Add a password reset code to the database
    async addResetCode(email, code) {
        const expires = DateTime.fromJSDate(new Date()).plus({ minutes: 10 }).toJSDate();
        await this.knex(password_reset_table).insert({ email, code, expires });
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

    // Get a user's password reset code if it exists
    async getResetCode(email) {
        const records = await this.knex(password_reset_table).where({ email });
        return records[0];
    }

    // Update a user record
    async updateUser(email, params) {
        const update = await this.knex(table).where({ email }).update({ ...params });
        const record = await this.knex(table).where({ email });
        return record[0];
    }

    // Set a reset code's used status to true
    async useCode(email) {
        await this.knex(password_reset_table).where({ email }).update({ used: true });
    }

    // Delete a user record
    async deleteUser(email) {
        const del = await this.knex(table).where({ email }).delete();
        return del;
    }

    // Delete the password reset code for a given user if it exists
    async deleteResetCode(email) {
        await this.knex(password_reset_table).where({ email }).delete();
    }

    // Delete all expired reset codes
    async deleteOldResetCodes() {
        const now = new Date();
        await this.knex(password_reset_table).where("expires", "<=", now).where({ used: false }).delete();
    }
}

module.exports = users;