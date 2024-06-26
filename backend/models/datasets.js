const metadata_table = "dataset_metadata";
const tag_table = "tags";
const all_col_table = "dataset_all_cols";
const text_col_table = "dataset_text_cols";
const likes_table = "liked_datasets";

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

    // Add initial metadata for a table
    async createMetadata(table_name, username, metadata = undefined) {
        if (typeof metadata === "object") {
            await this.knex(metadata_table).insert({ ...metadata, table_name, username, date_posted: new Date() });
        } else {
            await this.knex(metadata_table).insert({ table_name, username, is_public: 0, date_posted: new Date() });
        }
        
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Add a tag for a dataset
    async addTag(table_name, tags) {
        // Format table name and tags as an array of objects
        const data = [...new Set(tags)].map(x => ({ table_name, tag_name: x }));
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

    // Add columns to all cols table
    async addCols(table_name, cols) {
        // Format table name and cols as an array of objects
        const data = cols.map(x => ({ table_name, col: x }));
        // Insert records
        const insert = await this.knex(all_col_table).insert([ ...data ]);
        return insert;
    }

    // Like a dataset
    async addLike(user, table_name) {
        await this.knex(likes_table).insert({ user, table_name });
        const record = await this.knex(likes_table).where({ user, table_name });
        return record[0];
    }

    // Update the metadata of a table
    async updateMetadata(table_name, params) {
        const update = await this.knex(metadata_table).where({ table_name }).update({ ...params });
        const record = await this.knex(metadata_table).where({ table_name });
        return record;
    }

    // Increment the dataset's clicks
    async incClicks(table_name) {
        const update = await this.knex(metadata_table).where({ table_name }).increment("clicks", 1);
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Increment the dataset's likes
    async incLikes(table_name) {
        const update = await this.knex(metadata_table).where({ table_name }).increment("likes", 1);
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Decrement the dataset's likes
    async decLikes(table_name) {
        const update = await this.knex(metadata_table).where({ table_name }).decrement("likes", 1);
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Get the metadata for the given table
    async getMetadata(table_name) {
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
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
        const results = await this.knex(text_col_table).where({ table_name }).select("col");
        return results;
    }

    // Get column names
    async getColumnNames(table_name) {
        const results = await this.knex(all_col_table).where({ table_name }).select("col");
        return results;
    }

    // Filter datasets
    async getFilteredDatasets(params, username, paginate = true, currentPage = 1) {
        const query = this.knex(metadata_table).select(`${ metadata_table }.*`).distinct()
            .leftJoin(tag_table, `${ metadata_table }.table_name`, `${ tag_table }.table_name`)
            .leftJoin(likes_table, `${ metadata_table }.table_name`, `${ likes_table }.table_name`)
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
                const search = params.__search__;
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
                            tag_name.map(x => q.orWhere("tags.tag_name", x));
                        });
                    } else {
                        q.where("tags.tag_name", tag_name);
                    }
                }

                // Search for liked datasets
                const liked = params.liked;
                if (liked) {
                    q.where(`${ likes_table }.user`, liked);
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

        // Get tags and likes for search results
        for (let i = 0; i < results.length; i++) {
            const tags = await this.getTags(results[i].table_name);
            results[i].tags = tags.map(x => x.tag_name);
            results[i].liked = await this.getLike(results[i].username, results[i].table_name);
            results[i].likes = await this.getLikeCount(results[i].table_name);
        }

        return results;
    }

    // Get the number of datasets for a given set of filters
    async getFilteredDatasetsCount(params, username) {
        const results = await this.getFilteredDatasets(params, username, false);
        return results.length;
    }

    // Get the number of likes for this dataset
    async getLikeCount(table_name) {
        const results = await this.knex(likes_table).where({ table_name });
        return results.length;
    }

    // Determine if a given user liked a given dataset
    async getLike(user, table_name) {
        const results = await this.knex(likes_table).where({ user, table_name });
        return results.length > 0;
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

    // Delete a user's liked table
    async deleteLike(user, table_name) {
        await this.knex(likes_table).where({ user, table_name }).delete();
    }
}

module.exports = datasets;