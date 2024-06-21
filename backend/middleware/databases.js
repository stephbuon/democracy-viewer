const knex = require('knex');
const { attachPaginate } = require("knex-paginate");
const util = require("../util/database_config");

attachPaginate();

const createDatabaseConnection = async(req, res, next) => {
    try {
        const defaultConfig = util.defaultConfig();
        req.knex = knex(defaultConfig);
        req.knex.raw("SELECT 1");

        next();
    } catch (err) {
        console.error("Failed to create database connection:", err);
        res.status(500).json({message: err.toString()});
    }
}

const deleteDatabaseConnection = async(req, res, next) => {
    try {
        req.knex.destroy();
        delete req.knex;
    } catch (err) {
        console.error("Failed to delete database connection:", err);
        res.status(500).json({message: err.toString()});
    }

    next();
}

module.exports = {
    createDatabaseConnection,
    deleteDatabaseConnection
}