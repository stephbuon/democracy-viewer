const metadata_table = "dataset_metadata";
const tag_table = "tags";
const text_col_table = "dataset_text_cols";
const download_table = "dataset_download";
const split_text_table = "dataset_split_text";
const python = require("python-shell").PythonShell;
const files = require("../util/file_management");

class datasets {
    constructor(knex) {
        if (!knex) {
            throw new Error("Database connection not defined");
        }
        this.knex = knex;
    }

    // Create a table for a new dataset
    async createDataset(name, cols, lengths) {
        const table = await this.knex.schema.createTable(name, (table) => {
            // Create serial primary key
            table.increments("id").primary();

            // Add all column names as strings
            cols.map(x => {
                if (lengths[x] > 8000) {
                    table.text(x);
                } else {
                    table.string(x, lengths[x]);
                }
            });
        });

        return table;
    }

    // Add multiple rows to a dataset
    async addRows(table, rows) {
        const insert = await this.knex(table).insert([ ...rows ]);
        return insert;
    }

    // Add a row to a dataset
    async addRow(table, row) {
        const insert = await this.knex(table).insert({ ...row });
        return insert;
    }

    // Add initial metadata for a table
    async createMetadata(table_name, username) {
        const insert = await this.knex(metadata_table).insert({ table_name, username, is_public: 0, date_posted: new Date() });
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Add a tag for a dataset
    async addTag(table_name, tags) {
        // Format table name and tags as an array of objects
        const data = tags.map(x => ({ table_name, tag_name: x }));
        // Insert records
        const insert = await this.knex(tag_table).insert([ ...data ]);
        return insert;
    }

    // Add text columns for a dataset
    async addTextCols(table_name, cols) {
        // Format table name and cols as an array of objects
        const data = cols.map(x => ({ table_name, col: x }));
        // Insert records
        const insert = await this.knex(text_col_table).insert([ ...data ]);
        return insert;
    }

    // Insert a dataset upload record
    async addDownload(username, table_name, total_pages, current_page = 0) {
        // Insert record
        const timestamp = new Date();
        await this.knex(download_table).insert({ username, table_name, total_pages, current_page, timestamp });
        // Get record id
        let record;
        if (username) {
            record = await this.knex(download_table).select("id").where({ username, table_name, timestamp });
        } else {
            record = await this.knex(download_table).select("id").where({ table_name, timestamp }).whereNull("username");
        }
        return record[0].id;
    }

    // Update the metadata of a table
    async updateMetadata(table_name, params) {
        const update = await this.knex(metadata_table).where({ table_name }).update({ ...params });
        const record = await this.knex(metadata_table).where({ table_name });
        return record;
    }

    // Change the data type of the given column in the given table
    async changeColType(table, column, type) {
        const update = await this.knex.raw(`ALTER TABLE ${ table } ALTER COLUMN ${ column } ${ type }`);
        return update;
    }

    // Increment the dataset's clicks
    async incClicks(table_name) {
        const update = await this.knex(metadata_table).where({ table_name }).increment("clicks", 1);
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Increment the current page of a download
    async updateDownload(id) {
        await this.knex(download_table).where({ id }).increment("current_page", 1);
    }

    // Get the first n rows of a dataset (n = 10 by default)
    async getHead(table, n = 10) {
        const results = await this.knex(table).limit(n);
        return results;
    }

    // Get the metadata for the given table
    async getMetadata(table_name) {
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Get all datasets owned by a given user
    async getUserDatasets(username) {
        const records = await this.knex(metadata_table).where({ username });
        return records;
    }

    // Get all unique tags
    async getUniqueTags() {
        const results = await this.knex(tag_table).select("tag_name").distinct();
        return results;
    }

    // Get tags by datset
    async getTags(table_name) {
        const results = await this.knex(tag_table).where({ table_name });
        return results;
    }

    // Get text columns by dataset
    async getTextCols(table_name) {
        const results = await this.knex(text_col_table).where({ table_name });
        return results;
    }

    // Get column names
    async getColumnNames(table_name) {
        const results = await this.knex(table_name).columnInfo();
        return results;
    }

    // Get unique column values
    async getColumnValues(table_name, column) {
        const results = await this.knex(table_name).select(column).orderBy(column).distinct();
        return results;
    }

    // Filter datasets
    async getFilteredDatasets(params, username, paginate = true, currentPage = 1) {
        const query = this.knex(metadata_table).select(`${ metadata_table }.*`).distinct()
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
                    // Get private and public datasets
                    q.where(q => {
                        q.orWhere({ is_public: true });
                        if (username) {
                            q.orWhere({ is_public: false, username });
                        }
                    });
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
            const perPage = params.pageLength ? params.pageLength : 50;
            results = await query.orderBy("clicks", "desc").paginate({ perPage, currentPage });
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
    async subsetTable(table, params, paginate = true, currentPage = 1) {
        // Get dataset metadata
        const metadata = await this.getMetadata(table);

        // If dv_search in keys, process terms
        let terms = [];
        let processed_terms = undefined;
        if (Object.keys(params).includes("dv_search")) {
            // Split search string into words
            terms = params["dv_search"].split(" ");

            // If preprocessing_type is not none, process in Python
            if (metadata.preprocessing_type != "none") {
                // Setup Python config
                const file = "python/files/input/" + table + "_" + Date.now() + ".json";
                // Add file names as command line arguments
                const options = {
                    args: [ file, metadata.preprocessing_type, ...terms ]
                }
                
                // If a python path is provided in .env, use it
                // Else use the default path
                if (process.env.PYTHON_PATH) {
                    options["pythonPath"] = process.env.PYTHON_PATH;
                }

                // Run python program that generates graph data
                try {
                    await python.run("python/processing_helper.py", options).then(x => console.log(x)).catch(x => {
                        console.log(x);
                        throw new Error(x);
                    });
                    processed_terms = files.readJSON(file);
                } catch(err) {
                    if (files.fileExists(file)) {
                        throw new Error(err);
                    } else {
                        console.log(err)
                    }
                }
            }
        }

        const query = this.knex(table)
            // .select(`${ table }.*`)
            .innerJoin(split_text_table, `${ table }.id`, `${ split_text_table }.record_id`)
            .where(`${ split_text_table }.table_name`, "=", table)
            .where(q => {
                // Get the query object keys
                const keys = Object.keys(params);

                // Iterate through keys and and where clause for each
                keys.forEach(key => {
                    if (key === "pageLength") {
                        // Skip any key that is "pageLength"
                    } else if (key === "dv_search") {
                        // If the key is dv_search, search for search terms in split text

                        // Iterate through search words
                        for (let i = 0; i < terms.length; i++) {
                            q.where(q => {
                                // Get records where word like term
                                if (processed_terms && processed_terms[i] != terms[i]) {
                                    q.orWhereILike(`${ split_text_table }.word`, `%${ terms[i] }%`);
                                    q.orWhereILike(`${ split_text_table }.word`, `%${ processed_terms[i] }%`);
                                } else {
                                    q.whereILike(`${ split_text_table }.word`, `%${ terms[i] }%`);
                                }
                            });
                        }
                    } else if (!Array.isArray(params[key])) {
                        // If not an array, find exact value
                        q.where(`${ table }.${ key }`, "=", params[key])
                    } else if (params[key][0] === "like") {
                        // If first value is "like", find strings like all terms in this value
                        const terms = params[key][1].split(" ");
                        terms.forEach(term => {
                            q.whereILike(`${ table }.${ key }`, `%${ term }%`);
                        });
                    } else if (params[key][0] === "greater") {
                        // If first value is "greater", find values greater than this value
                        q.where(`${ table }.${ key }`, ">=", params[key][1]);
                    } else if (params[key][0] === "less") {
                        // If first value is "less", find values less than this value
                        q.where(`${ table }.${ key }`, "<=", params[key][1]);
                    } else {
                        // Else, find values between these values
                        q.where(`${ table }.${ key }`, ">=", params[key][0]);
                        q.where(`${ table }.${ key }`, "<=", params[key][1]);
                    }
                });
            }
        );

        let results;
        if (paginate === true) {
            const perPage = params.pageLength ? params.pageLength : 50;
            console.log(currentPage)
            results = await query.select(`${ table }.*`).distinct().orderBy("id").paginate({ perPage, currentPage });
            return results.data;
        } else if (paginate === false) {
            console.log("why am i here")
            results = await query.select(`${ table }.*`).distinct().orderBy("id");
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

    // Get all records from the given table with the given ids
    async getRecordsByIds(table, ids) {
        const results = await this.knex(table).whereIn("id", ids);
        return results;
    }

    // Get a download record by username and table
    async getDownload(username, table_name) {
        let record;
        if (username) {
            record = await this.knex(download_table).select(["timestamp", "current_page", "total_pages"]).where({ username, table_name });
        } else {
            record = await this.knex(download_table).select(["timestamp", "current_page", "total_pages"]).where({ table_name }).whereNull("username");
        }
        
        return record[0];
    }

    // Delete a dataset table
    async deleteTable(name) {
        const del = await this.knex.schema.dropTable(name);
        return del;
    }

    // Delete a dataset's metadata
    async deleteMetadata(table_name) {
        const del = await this.knex(metadata_table).where({ table_name }).delete();
        return del;
    }

    // Delete tag on a dataset
    async deleteTag(table_name, tag_name) {
        const del = await this.knex(tag_table).where({ table_name, tag_name }).delete();
        return del;
    }

    // Delete a text column for a dataset
    async deleteTextCol(table_name, col) {
        const del = await this.knex(text_col_table).where({ table_name, col }).delete();
        return del;
    }

    // Delete a download
    async deleteDownload(id) {
        await this.knex(download_table).where({ id }).delete();
    }
}

module.exports = datasets;