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
    async createMetadata(email, metadata = undefined) {
        console.log(metadata)
        if (typeof metadata === "object") {
            console.log({ ...metadata, email, date_posted: new Date() })
            await this.knex(metadata_table).insert({ ...metadata, email, date_posted: new Date() });
        } else {
            await this.knex(metadata_table).insert({ table_name, email, is_public: 0, date_posted: new Date() });
        }
        
        const record = await this.knex(metadata_table)
            .orderBy("id", "desc")
            .limit(1);

        return record[0];
    }
}

module.exports = graphs;