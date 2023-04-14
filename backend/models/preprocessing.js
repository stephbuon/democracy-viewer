const knex = require("../db/knex");

const split_table = "dataset_split_text";
const embedding_table = "dataset_word_embeddings";

class preprocessing {
    async addSplitWords(records) {
        const insert = await knex(split_table).insert([ ...records ]);
        // const queries = records.map(row => knex(split_table).insert({ ...row }));
        // const query = queries.map(q => q.toString()).join("; ");
        // const insert = await knex.raw(query);
        return insert;
    }

    async addEmbeddings(records) {
        const insert = await knex(embedding_table).insert([ ...records ]);
        return insert;
    }
}

module.exports = preprocessing;