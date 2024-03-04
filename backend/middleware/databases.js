// const default_db = require("../knexfile");
const knex = require('knex');
const { attachPaginate } = require("knex-paginate");
const control = require("../controllers/databases");
const util = require("../util/database_config");

attachPaginate();

const createDatabaseConnection = async(req, res, next) => {
    try {
        const regex = new RegExp("/datasets*|/graphs*");
    
        let config;
        const defaultConfig = util.defaultConfig();
        if (regex.test(req.originalUrl) && req.user && req.user.database) {
            const tmpConnection = knex(defaultConfig);
            config = await control.loadConnection(tmpConnection, req.user.database);
            tmpConnection.destroy();
        } else {
            config = defaultConfig;
        }
        
        req.knex = knex(config);
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