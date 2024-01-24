const knex = require("../db/knex");

const connections_table = "database_connections";

class databases {
    async newConnection(name, owner, is_public, host, port, db, username, password, client) {
        await knex(connections_table).insert({
            name, owner, is_public, host, port, db, username, password, client
        });
        const record = await knex(connections_table).orderBy("id", "desc").limit(1);
        return record[0];
    }

    async getCredentials(id) {
        return await knex(connections_table).where({ id });
    }
};

module.exports = databases;