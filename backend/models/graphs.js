const knex = require("../db/knex");

const split_table = "dataset_split_text";
const embedding_table = "dataset_word_embeddings";

class graphs {
    // Join split text records with raw records with given values in given column
    async getGroupSplits(table_name, column = null, values = null, words = null) {
        // Count how many records their are
        let numRecords = await knex(split_table)
            .join(table_name, `${ split_table }.record_id`, `${ table_name }.id`)
            .where(q => {
                q.where({ table_name });

                if (column && values[0]) {
                    q.whereIn(column, values);
                }

                if (words && words[0]) {
                    q.whereIn(`${ split_table }.word`, words);
                }
            }).count({ count: "*" });
        numRecords = numRecords[0].count;

        // Initialze records and page number
        let records = [];
        let currentPage = 1;
        // Specify columns to select
        const selectCols = {
            id: `${ table_name }.id`,
            word: `${ split_table }.word`,
            n: `${ split_table }.count`,
            word: `${ split_table }.word`
        }
        if (column) {
            selectCols.group = `${ table_name }.${ column }`;
        }
        for (let i = 0; i < numRecords; i += 500000) {
            // Get next page
            const curr = await knex(split_table)
                .join(table_name, `${ split_table }.record_id`, `${ table_name }.id`)
                .select({ ...selectCols })
                .where(q => {
                    q.where({ table_name });

                    if (column && values[0]) {
                        q.whereIn(column, values);
                    }

                    if (words && words[0]) {
                        q.whereIn(`${ split_table }.word`, words);
                    }
                }).orderBy(`${ split_table }.word`).paginate({ perPage: 500000, currentPage });;

            // Add page to records
            records = [ ...records, ...curr.data ];
            // Array.prototype.push.apply(records, curr.data);
            currentPage++;
        }

        return records;
    }

    // Get all word embeddings for the given table
    async getWordEmbeddings(table_name) {
        let numRecords = await knex(embedding_table)
            .where({ table_name })
            .count({ count: "*" });
        numRecords = numRecords[0].count;
        
        const records = [];
        let currentPage = 1;
        for (let i = 0; i < numRecords; i += 500000) {
            const curr = await knex(embedding_table)
            .where({ table_name })
            .orderBy("word").paginate({ perPage: 500000, currentPage });
            
            Array.prototype.push.apply(records, curr.data);
            currentPage++;
        }

        return records;
    }
}

module.exports = graphs;