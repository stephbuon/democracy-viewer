const knex = require("../db/knex");

const split_table = "dataset_split_text";
const embedding_table = "dataset_embeddings";

class preprocessing {
    async addSplitWord(record) {
        const insert = await knex(split_table).insert({ ...record });
        return insert;
    }

    async addEmbedding(record) {
        const insert = await knex(embedding_table).insert({ ...record });
        return insert;
    }
}

module.exports = preprocessing;