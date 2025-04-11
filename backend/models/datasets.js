const metadata_table = "dataset_metadata";
const tag_table = "tags";
const all_col_table = "dataset_all_cols";
const text_col_table = "dataset_text_cols";
const embed_col_table = "dataset_embed_cols";
const likes_table = "liked_datasets";
const suggestion_table = "text_updates";
const group_table = "group_datasets";
const group_members_table = "group_members";

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
    async createMetadata(table_name, email, metadata = undefined) {
        if (typeof metadata === "object") {
            await this.knex(metadata_table).insert({ ...metadata, table_name, email, date_posted: new Date() });
        } else {
            await this.knex(metadata_table).insert({ table_name, email, is_public: 0, date_posted: new Date() });
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

    // Add embeddings columns for a dataset
    async addEmbedCols(table_name, cols) {
        // Format table name and cols as an array of objects
        const data = cols.map(x => ({ table_name, col: x }));
        // Insert records
        const insert = await this.knex(embed_col_table).insert([ ...data ]);
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
    async addLike(email, table_name) {
        await this.knex(likes_table).insert({ email, table_name });
        const record = await this.knex(likes_table).where({ email, table_name });
        return record[0];
    }

    // Add a text change suggestion
    async addSuggestion(email, params) {
        const insert = await this.knex(suggestion_table).insert({ email, ...params });
        const id = insert[0];
        const record = await this.knex(suggestion_table).where({ id });
        return record[0]
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

    // Increment the number of unprocessed updates
    async incUpdates(table_name) {
        await this.knex(metadata_table).where({ table_name }).increment("unprocessed_updates", 1);
    }

    // Get the metadata for the given table
    async getMetadata(table_name) {
        const record = await this.knex(metadata_table).where({ table_name });
        return record[0];
    }

    // Get all unique tags
    async getUniqueTags(search = "", currentPage = 1, perPage = 10) {
        const results = await this.knex(tag_table)
            .select("tag_name")
            .count("tag_name as total")
            .groupBy("tag_name")
            .having(q => {
                if (search) {
                    q.whereILike("tag_name", `%${ search }%`)
                }
            })
            .orderBy("total", "desc")
            .orderBy("tag_name")
            .paginate({ currentPage, perPage })

        return results.data;
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

    // Get embedding columns by dataset
    async getEmbedCols(table_name) {
        const results = await this.knex(embed_col_table).where({ table_name }).select("col");
        return results;
    }

    // Get column names
    async getColumnNames(table_name) {
        const results = await this.knex(all_col_table).where({ table_name }).select("col");
        return results;
    }

    // Filter datasets
    async getFilteredDatasets(params, email, currentPage = 1) {
        const query = this.knex(metadata_table).select(`${ metadata_table }.*`).distinct()
            .leftJoin(tag_table, `${ metadata_table }.table_name`, `${ tag_table }.table_name`)
            .leftJoin(likes_table, `${ metadata_table }.table_name`, `${ likes_table }.table_name`)
            .leftJoin(group_table, `${ metadata_table }.table_name`, `${ group_table }.table_name`)
            .where(q => {
                // Filter by type (public/private)
                const type = params.type;
                if (type === "public") {
                    // Get public datasets
                    q.where({ is_public: true });
                } else if (type === "private") {
                    // Get private datasets
                    if (!email) {
                        // Throw error if user is not logged in
                        throw new Error("Cannot find private datasets if user is not logged in.");
                    }

                    // Get private datasets created by this user
                    q.where({ is_public: false, "dataset_metadata.email": email });
                } else {
                    // Get private and public datasets
                    q.where(q => {
                        q.orWhere({ is_public: true });
                        if (email) {
                            q.orWhere({ is_public: false, "dataset_metadata.email": email });

                            if (params.group) {
                                q.orWhere(`${ group_table }.private_group`, params.group);
                            }
                        }
                    });
                }

                // Filter by user
                const user = params.user;
                if (user) {
                    q.whereILike("dataset_metadata.email", `%${ user }%`);
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
                    q.where(`${ likes_table }.email`, liked);
                }

                // Search for private group datasets
                const group = params.group;
                if (group) {;
                    q.where(`${ group_table }.private_group`, group);
                }
            });

        const perPage = params.pageLength ? params.pageLength : 10;
        const results = await query.orderBy("clicks", "desc").paginate({ perPage, currentPage });

        return {
            results: results.data,
            total: results.pagination.total
        }
    }

    // Get the number of likes for this dataset
    async getLikeCount(table_name) {
        const results = await this.knex(likes_table).where({ table_name });
        return results.length;
    }

    // Determine if a given user liked a given dataset
    async getLike(email, table_name) {
        const results = await this.knex(likes_table).where({ email, table_name });
        return results.length > 0;
    }

    // Get paginated suggestions from a given user
    async getSuggestionsFrom(email, currentPage = 1, perPage = 10, sort_col = undefined, ascending = true) {
        let query = this.knex(suggestion_table)
            .select(`${ suggestion_table }.*`, { owner_email: `${ metadata_table }.email`})
            .distinct()
            .leftJoin(metadata_table, `${ suggestion_table }.table_name`, `${ metadata_table }.table_name`)
            .where(`${ suggestion_table }.email`, email);
        
        if (sort_col) {
            query.orderBy(sort_col, ascending ? "asc" : "desc");
        }

        const results = await query.paginate({ currentPage, perPage, isLengthAware: true });
        return {
            data: results.data,
            total: results.pagination.total
        }
    }

    // Get paginated suggestions to a given user
    async getSuggestionsFor(email, currentPage = 1, perPage = 10, sort_col = undefined, ascending = true) {
        const query = this.knex(suggestion_table)
            .select(`${ suggestion_table }.*`, { owner_email: `${ metadata_table }.email`})
            .distinct()
            .leftJoin(metadata_table, `${ suggestion_table }.table_name`, `${ metadata_table }.table_name`)
            .where(`${ metadata_table }.email`, email);

        if (sort_col) {
            query.orderBy(sort_col, ascending ? "asc" : "desc");
        }

        const results = await query.paginate({ currentPage, perPage, isLengthAware: true });
        return {
            data: results.data,
            total: results.pagination.total
        }
    }

    // Get a suggestion by its id
    async getSuggestion(id) {
        const record = await this.knex(suggestion_table)
            .select(`${ suggestion_table }.*`, { owner_email: `${ metadata_table }.email`})
            .distinct()
            .leftJoin(metadata_table, `${ suggestion_table }.table_name`, `${ metadata_table }.table_name`)
            .where(`${ suggestion_table }.id`, id);

        return record[0];
    }

    // Check if a user has access to a dataset via a private group
    async hasDatasetAccessGroup(table_name, member) {
        const result = await this.knex(group_table)
            .select(`${ group_table }.*`)
            .join(group_members_table, `${ group_table }.private_group`, `${ group_members_table }.private_group`)
            .where({ table_name, member })
            .paginate({ currentPage: 1, pageLength: 1 });

        return result.pagination.total > 0;
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
    async deleteLike(email, table_name) {
        await this.knex(likes_table).where({ email, table_name }).delete();
    }

    // Delete a suggestion by its id
    async deleteSuggestionById(id) {
        await this.knex(suggestion_table).where({ id }).delete();
    }
}

module.exports = datasets;