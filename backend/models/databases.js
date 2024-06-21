const connections_table = "distributed_connections";

class databases {
    constructor(knex) {
        if (!knex) {
            throw new Error("Distributed connection not defined");
        }
        this.knex = knex;
    }

    async newConnection(name, owner, params) {
        const current = await this.knex(connections_table).where({ name, owner });
        if (current.length > 0) {
            throw new Error(`Connection name ${ name } is not unique for user ${ owner }`);
        }
        await this.knex(connections_table).insert({
            name, owner, ...params
        });
        const record = await this.knex(connections_table).where({ name, owner });
        return record[0];
    }

    async getCredentials(id) {
       const record = await this.knex(connections_table).where({ id });
       return record[0];
    }

    async getConnectionsByUser(owner) {
        return await this.knex(connections_table).where({ owner });
    }
};

module.exports = databases;