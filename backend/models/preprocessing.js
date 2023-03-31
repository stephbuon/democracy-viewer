const knex = require("../db/knex");

const split_table = "dataset_split_text";

class preprocessing {
    async addSplitWord(record) {
        const insert = await knex(split_table).insert({ ...record });
        return insert;
    }
}

module.exports = preprocessing;