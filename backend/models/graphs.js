const metadata_table = "graph_metadata";
const tag_table = "graph_tags";
const likes_table = "liked_graphs";
const groups_table = "group_graphs";

class graphs {
    constructor(knex) {
        if (!knex) {
            throw new Error("Database connection not defined");
        }
        this.knex = knex;
    }

    // Add initial metadata for a graph
    async createMetadata(email, metadata) {
        await this.knex(metadata_table).insert({ ...metadata, email, date_posted: new Date() });
        
        const record = await this.knex(metadata_table)
            .orderBy("id", "desc")
            .limit(1);

        return record[0];
    }

    // Like a graph
    async addLike(email, graph_id) {
        await this.knex(likes_table).insert({ email, graph_id });
        const record = await this.knex(likes_table).where({ email, graph_id });
        return record[0];
    }

    // Update graph metadata
    async updateMetadata(id, params) {
        await this.knex(metadata_table)
            .where({ id })
            .update({ ...params });

        const record = await this.knex(metadata_table).where({ id });
        return record[0];
    }

    // View a graph
    async incrementClicks(id) {
        await this.knex(metadata_table)
            .where({ id })
            .increment("clicks");

        const record = await this.knex(metadata_table).where({ id });
        return record[0];
    }

    // Get a dataset by id
    async getMetadataById(id) {
        const records = await this.knex(metadata_table).where({ id });
        return records[0];
    }

    // Filter metadata
    async getFilteredGraphs(params, email, currentPage = 1) {
        const query = this.knex(metadata_table).select(`${ metadata_table }.*`).distinct()
            // .leftJoin(tag_table, `${ metadata_table }.id`, `${ tag_table }.graph_id`)
            .leftJoin(likes_table, `${ metadata_table }.id`, `${ likes_table }.graph_id`)
            .leftJoin(groups_table, `${ metadata_table }.id`, `${ groups_table }.graph_id`)
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
                    q.where({ is_public: false, "graph_metadata.email": email });
                } else {
                    // Get private and public datasets
                    q.where(q => {
                        q.orWhere({ is_public: true });
                        if (email) {
                            q.orWhere({ is_public: false, "graph_metadata.email": email });
                        }
                    });
                }

                // Filter by user
                const user = params.user;
                if (user) {
                    q.whereILike(`${ metadata_table }.email`, `%${ user }%`);
                }

                // Filter by s3 id
                const s3_id = params.s3_id;
                if (s3_id) {
                    q.where({ s3_id });
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
                // const tag_name = params.tag;
                // if (tag_name) {
                //     // If tag is an array, find datasets with all tags
                //     if (Array.isArray(tag_name)) {
                //         q.where(q => {
                //             tag_name.map(x => q.orWhere(`${ tag_table }.tag_name`, x));
                //         });
                //     } else {
                //         q.where(`${ tag_table }.tag_name`, tag_name);
                //     }
                // }

                // Search for liked datasets
                const liked = params.liked;
                if (liked) {
                    q.where(`${ likes_table }.email`, liked);
                }

                // Search for liked datasets
                const group = params.group;
                if (group) {
                    q.where(`${ groups_table }.private_group`, group);
                }
            });

        const perPage = params.pageLength ? params.pageLength : 10;
        const results = await query.orderBy("clicks", "desc").paginate({ perPage, currentPage });

        return {
            results: results.data,
            total: results.pagination.total
        }
    }

    // Get the number of likes for this graph
    async getLikeCount(graph_id) {
        const results = await this.knex(likes_table).where({ graph_id });
        return results.length;
    }

    // Determine if a given user liked a given graph
    async getLike(email, graph_id) {
        const results = await this.knex(likes_table).where({ email, graph_id });
        return results.length > 0;
    }

    // Get all graphs with an s3 id
    async getGraphsByS3Id(s3_id) {
        return await this.knex(metadata_table).where({ s3_id });
    }

    // Delete metadata by id
    async deleteMetadataById(id) {
        await this.knex(metadata_table)
            .where({ id })
            .delete();
    }

    // Delete a user's liked graph
    async deleteLike(email, graph_id) {
        await this.knex(likes_table).where({ email, graph_id }).delete();
    }
}

module.exports = graphs;