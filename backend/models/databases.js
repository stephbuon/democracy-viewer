const connections_table = "database_connections";

class databases {
    constructor(knex) {
        if (!knex) {
            throw new Error("Database connection not defined");
        }
        this.knex = knex;
    }

    async newConnection(name, owner, is_public, host, port, db, username, password, client) {
        await this.knex(connections_table).insert({
            name, owner, is_public, host, port, db, username, password, client
        });
        const record = await this.knex(connections_table).orderBy("id", "desc").limit(1);
        return record[0];
    }

    async getCredentials(id) {
       const record = await this.knex(connections_table).where({ id });
       return record[0];
    }
};

module.exports = databases;