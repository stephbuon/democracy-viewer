const knex = require("../db/knex");

class datasets {
    // Create a table for a new dataset
    async createDataset(name, cols) {
        const table = await knex.schema.createTable(name, (table) => {
            // Create serial primary key
            table.increments("id").primary();

            // Add all column names as strings
            cols.map(x => {
                table.string(x);
            });
        });

        return table;
    }

    // Add a row to a dataset
    async addRow(name, row) {
        const insert = await knex(name).insert({ ...row });
        return insert;
    }

    // Get the first n rows of a dataset (n = 10 by default)
    async getHead(name, n = 10) {
        const results = await knex(name).limit(n);
        return results;
    }

    // Change the data type of the given column in the given table
    async changeColType (table, column, type) {
        const update = await knex.raw(`ALTER TABLE ${ table } MODIFY ${ column } ${ type }`);
        return update;
    }
}

module.exports = datasets;