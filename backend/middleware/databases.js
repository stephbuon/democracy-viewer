const default_db = require("../knexfile");
const knex = require('knex');
const { attachPaginate } = require("knex-paginate");
const db = require("../models/databases");
const databases = new db;
const control = require("../controllers/databases");

const createDatabaseConnection = async(req, res, next) => {
    attachPaginate();
    let config = {};
    if (req.user.database) {
        config = await control.loadConnection(req.user.database);
    } else {
        config = default_db.development;
    }

    req.knex = knex(config);

    next();
}

module.exports = {
    createDatabaseConnection
}