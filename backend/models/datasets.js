const knex = require("../db/knex");

const metadata_table = "dataset_metadata";

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
    async addRow(table, row) {
        const insert = await knex(table).insert({ ...row });
        return insert;
    }

    // Add initial metadata for a table
    async createMetadata(params) {
        const insert = await knex(metadata_table).insert({ ...params });
        const record = await knex(metadata_table).where({ table_name: params.table_name });
        return record[0];
    }

    // Update the metadata of a table
    async updateMetadata(table_name, params) {
        const update = await knex(metadata_table).where({ table_name }).update({ ...params });
        const record = await knex(metadata_table).where({ table_name });
        return record;
    }

    // Change the data type of the given column in the given table
    async changeColType(table, column, type) {
        const update = await knex.raw(`ALTER TABLE ${ table } MODIFY ${ column } ${ type }`);
        return update;
    }

    // Get the first n rows of a dataset (n = 10 by default)
    async getHead(table, n = 10) {
        const results = await knex(table).limit(n);
        return results;
    }

    // Get the metadata for the given table
    async getMetadata(table_name) {
        const record = await knex(metadata_table).where({ table_name });
        return record[0];
    }
}

module.exports = datasets;