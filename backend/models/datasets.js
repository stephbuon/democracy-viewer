const knex = require("../db/knex");

const metadata_table = "dataset_metadata";
const tag_table = "tags";

class datasets {
    // Create a table for a new dataset
    async createDataset(name, cols, lengths) {
        const table = await knex.schema.createTable(name, (table) => {
            // Create serial primary key
            table.increments("id").primary();

            // Add all column names as strings
            cols.map(x => {
                table.string(x, lengths[x]);
            });
        });

        return table;
    }

    // Add multiple rows to a dataset
    async addRows(table, rows) {
        const queries = rows.map(row => knex(table).insert({ ...row }));
        const query = queries.map(q => q.toString()).join("; ");
        const insert = await knex.raw(query);
        return insert;
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
        const update = await knex.raw(`ALTER TABLE ${ table } ALTER COLUMN ${ column } ${ type }`);
        return update;
    }

    // Increment the dataset's clicks
    async incClicks(table_name) {
        const update = await knex(metadata_table).where({ table_name }).increment("clicks", 1);
        const record = await knex(metadata_table).where({ table_name });
        return record[0];
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

    // Filter datasets
    async getFilteredDatasets(params, username, paginate = true, page = 1) {
        const query = knex(metadata_table).select(`${ metadata_table }.*`).distinct()
            .leftJoin(tag_table, `${ metadata_table }.table_name`, `${ tag_table }.table_name`)
            .where(q => {
                // Filter by type (public/private)
                const type = params.type;
                if (type === "public") {
                    // Get public datasets
                    q.where({ is_public: true });
                } else if (type === "private") {
                    // Get private datasets
                    if (!username) {
                        // Throw error if user is not logged in
                        throw new Error("Cannot find private datasets if user is not logged in.");
                    }

                    // Get private datasets created by this user
                    q.where({ is_public: false, username });
                } else {
                    // Throw error if type if not public/private
                    throw new Error("Public/private dataset type not defined.");
                }

                // Filter by user
                const user = params.username;
                if (user) {
                    const terms = user.split(" ");
                    terms.forEach(term => {
                        q.whereILike("username", `%${ term }%`);
                    });
                }

                // Filter by private group
                const private_group = params.private_group;
                if (private_group) {
                    q.where({ private_group });
                }

                // Filter by title
                const title = params.title;
                if (title) {
                    const terms = title.split(" ");
                    terms.forEach(term => {
                        q.whereILike("title", `%${ term }%`);
                    });
                }

                // Filter by description
                const description = params.description;
                if (description) {
                    const terms = description.split(" ");
                    terms.forEach(term => {
                        q.whereILike("description", `%${ term }%`);
                    });
                }

                // Search all text fields
                const search = params.search;
                if (search) {
                    q.where(q => {
                        const terms = search.split(" ");
                        terms.forEach(term => {
                            q.orWhereILike("title", `%${ term }%`);
                            q.orWhereILike("description", `%${ term }%`);
                        });
                    })
                }

                // Search for tags
                const tag_name = params.tag;
                if (tag_name) {
                    // If tag is an array, find datasets with all tags
                    if (Array.isArray(tag_name)) {
                        q.where(q => {
                            tag_name.map(x => q.orWhere({ tag_name: x }));
                        });
                    } else {
                        q.where({ tag_name });
                    }
                }
            });

        let results;
        if (paginate) {
            results = await query.orderBy("clicks", "desc").paginate({ perPage: 50, currentPage: page });
            results = results.data;
        } else {
            results = await query;
        }

        // Get tags for search results
        for (let i = 0; i < results.length; i++) {
            const tags = await this.getTags(results[i].table_name);
            results[i].tags = tags.map(x => x.tag_name);
        }

        return results;
    }

    // Get the number of datasets for a given set of filters
    async getFilteredDatasetsCount(params, username) {
        const results = await this.getFilteredDatasets(params, username, false);
        return results.length;
    }

    // Get a subset of a dataset
    async subsetTable(table, params, paginate = true, page = 1) {
        // Get the first record in case col names are needed
        const head = await this.getHead(table, 1);

        const query = knex(table).where(q => {
            // Get the query object keys
            const keys = Object.keys(params);

            // Iterate through keys and and where clause for each
            keys.forEach(key => {
                if (key === "col_search") {
                    // If the key is col_search, search for search terms in all columns

                    // Split search string into words
                    const terms = params[key].split(" ");
                    // Get column names from first record
                    const colNames = Object.keys(head[0]);

                    // Iterate through search words
                    for (let i = 0; i < terms.length; i++) {
                        q.where(q => {
                            // Iterate through column names
                            for (let j = 0; j < colNames.length; j++) {
                                if (typeof head[0][colNames[j]] === "string") {
                                    // Get results where column value like term (if column contains strings)
                                    q.orWhereILike(colNames[j], `%${ terms[i] }%`);
                                } else if (typeof head[0][colNames[j]] === "number") {
                                    // Get results when column value equals term (if column contains numbers and term is a number)
                                    if (!isNaN(parseFloat(terms[i])) && !Number.isInteger(head[0][colNames[j]])) {
                                        // If search term and column value are floats
                                        q.orWhere(colNames[j], "=", parseFloat(terms[i]));
                                    } else if (!isNaN(parseInt(terms[i])) && Number.isInteger(head[0][colNames[j]])) {
                                        // If search term and column value are ints
                                        q.orWhere(colNames[j], "=", parseInt(terms[i]));
                                    }
                                }
                            }
                        });
                    }
                } else if (!Array.isArray(params[key])) {
                    // If not an array, find exact value
                    q.where({ [key]: params[key] })
                } else if (params[key][0] === "like") {
                    // If first value is "like", find strings like all terms in this value
                    const terms = params[key][1].split(" ");
                    terms.forEach(term => {
                        q.whereILike(key, `%${ term }%`);
                    });
                } else if (params[key][0] === "greater") {
                    // If first value is "greater", find values greater than this value
                    q.where(key, ">=", params[key][1]);
                } else if (params[key][0] === "less") {
                    // If first value is "less", find values less than this value
                    q.where(key, "<=", params[key][1]);
                } else {
                    // Else, find values between these values
                    q.where(key, ">=", params[key][0]);
                    q.where(key, "<=", params[key][1]);
                }
            });
        });

        let results;
        if (paginate === true) {
            results = await query.orderBy("id").paginate({ perPage: 50, currentPage: page });
            return results.data;
        } else if (paginate === false) {
            results = await query;
            return results;
        } else {
            results = await query.count({ count: "*" });
            return results[0].count;
        }
    }

    // Get the number of records in a dataset subset
    async subsetTableCount(table, params) {
        const results = await this.subsetTable(table, params, null);
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