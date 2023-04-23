const knex = require("../db/knex");

const split_table = "dataset_split_text";
const embedding_table = "dataset_word_embeddings";

class preprocessing {
    async addSplitWords(records) {
        const insert = await knex(split_table).insert([ ...records ]);
        return insert;
    }

    async getSplitsCount(table_name) {
        const count = await knex(split_table).where({ table_name }).count({ count: "*" });
        return count[0].count;
    }

    async deleteSplitRecords(table_name) {
        await knex(split_table).where({ table_name }).delete();
    }

    async addEmbeddings(records) {
        const insert = await knex(embedding_table).insert([ ...records ]);
        return insert;
    }

    async getEmbeddingsCount(table_name) {
        const count = await knex(embedding_table).where({ table_name }).count({ count: "*" });
        return count[0].count;
    }

    async deleteEmbeddingRecords(table_name) {
        await knex(embedding_table).where({ table_name }).delete();
    }
}

module.exports = preprocessing;