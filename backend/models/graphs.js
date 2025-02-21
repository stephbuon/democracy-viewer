const metadata_table = "graph_metadata";
const tag_table = "graph_tags";
const likes_table = "liked_graphs";

class graphs {
    constructor(knex) {
        if (!knex) {
            throw new Error("Database connection not defined");
        }
        this.knex = knex;
    }

    // Add initial metadata for a graph
    async createMetadata(email, metadata) {
        console.log(metadata)
        if (typeof metadata === "object") {
            console.log({ ...metadata, email, date_posted: new Date() })
            await this.knex(metadata_table).insert({ ...metadata, email, date_posted: new Date() });
        }
        
        const record = await this.knex(metadata_table)
            .where({ s3_id: metadata.s3_id, email });

        return record[0];
    }

    // Filter metadata
    async getFilteredGraphs(params, email, paginate = true, currentPage = 1) {
        const query = this.knex(metadata_table).select(`${ metadata_table }.*`).distinct()
            // .leftJoin(tag_table, `${ metadata_table }.table_name`, `${ tag_table }.table_name`)
            // .leftJoin(likes_table, `${ metadata_table }.table_name`, `${ likes_table }.table_name`)
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
                // const liked = params.liked;
                // if (liked) {
                //     q.where(`${ likes_table }.email`, liked);
                // }
            });

        let results;
        if (paginate) {
            const perPage = params.pageLength ? params.pageLength : 10;
            results = await query.orderBy("clicks", "desc").paginate({ perPage, currentPage });
            results = results.data;
        } else {
            results = await query;
        }

        return results;
    }

    // Count the number of graphs that match filter parameters
    async getFilteredGraphsCount(params, email) {
        const results = await this.getFilteredGraphs(params, email, false);
        return results.length;
    }
}

module.exports = graphs;