const knex = require("../db/knex");

const split_table = "dataset_split_text";
const embedding_table = "dataset_word_embeddings";

class graphs {
    // Join split text records with raw records with given values in given column
    async getGroupSplits(table_name, column = null, values = null, words = null) {
        const records = await knex(split_table)
            .join(table_name, `${ split_table }.record_id`, `${ table_name }.id`)
            .select({
                id: `${ table_name }.id`,
                word: `${ split_table }.word`,
                n: `${ split_table }.count`,
                word: `${ split_table }.word`,
                group: `${ table_name }.${ column }`
            }).where(q => {
                if (column) {
                    q.whereIn(column, values);
                }

                if (words) {
                    q.whereIn(`${ split_table }.word`, words);
                }
            });

        return records;
    }

    // Get all word embeddings for the given table
    async getWordEmbeddings(table_name) {
        const records = await knex(embedding_table).where({ table_name });

        return records;
    }
}

module.exports = graphs;