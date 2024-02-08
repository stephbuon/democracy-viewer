const default_db = require("../knexfile");
const knex = require('knex');
const { attachPaginate } = require("knex-paginate");
const control = require("../controllers/databases");

attachPaginate();

const createDatabaseConnection = async(req, res, next) => {
    const regex = new RegExp("/datasets*|/graphs*");
    
    let config = {};
    if (regex.test(req.originalUrl) && req.user && req.user.database) {
        const tmpConnection = knex(default_db.development);
        config = await control.loadConnection(tmpConnection, req.user.database);
        tmpConnection.destroy();
    } else {
        config = default_db.development;
    }
    
    req.knex = knex(config);

    next();
}

const deleteDatabaseConnection = async(req, res, next) => {
    req.knex.destroy();
    delete req.knex;

    next();
}

module.exports = {
    createDatabaseConnection,
    deleteDatabaseConnection
}