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
}

module.exports = datasets;