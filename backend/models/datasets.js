const knex = require("../db/knex");

const metadata_table = "dataset_metadata";
const tag_table = "tags";

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

    // Add a tag for a dataset
    async addTag(table_name, tag_name) {
        const insert = await knex(tag_table).insert({ table_name, tag_name });
        const record = await knex(tag_table).where({ table_name, tag_name });
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

    // Get all records in a dataset
    async getDataset(table) {
        const results = await knex(table);
        return results;
    }

    // Get all unique tags
    async getUniqueTags() {
        const results = await knex(tag_table).select("tag_name").distinct();
        return results;
    }

    // Get tags by datset
    async getTags(table_name) {
        const results = await knex(tag_table).where({ table_name });
        return results;
    }

    // Delete a dataset table
    async deleteTable(name) {
        const del = await knex.schema.dropTable(name);
        return del;
    }

    // Delete a dataset's metadata
    async deleteMetadata(table_name) {
        const del = await knex(metadata_table).where({ table_name }).delete();
        return del;
    }

    // Delete tag on a dataset
    async deleteTag(table_name, tag_name) {
        const del = await knex(tag_table).where({ table_name, tag_name }).delete();
        return del;
    }
}

module.exports = datasets;