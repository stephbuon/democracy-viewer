const knex = require("../db/knex");

const split_table = "dataset_split_text";

class graphs {
    // Join split text records with raw records with given values in given column
    async getGroupSplits(table_name, column, values, words = null) {
        const records = await knex(split_table)
            .join(table_name, `${ split_table }.record_id`, `${ table_name }.id`)
            .select({
                id: `${ table_name }.id`,
                word: `${ split_table }.word`,
                n: `${ split_table }.count`,
                word: `${ split_table }.word`,
                group: `${ table_name }.${ column }`
            }).where(q => {
                q.whereIn(column, values);

                if (words) {
                    q.whereIn(`${ split_table }.word`, words);
                }
            });

        return records;
    }
}

module.exports = graphs;