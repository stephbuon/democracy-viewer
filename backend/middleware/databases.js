const default_db = require("../knexfile");
const knex = require('knex');
const { attachPaginate } = require("knex-paginate");
const control = require("../controllers/databases");

const createDatabaseConnection = async(req, res, next) => {
    const regex = new RegExp("/userws*");
    
    let config = {};
    if (!regex.test(req.originalUrl) && req.user && req.user.database) {
        config = await control.loadConnection(req.user.database);
    } else {
        config = default_db.development;
    }
    console.log(config)
    attachPaginate();
    req.knex = knex(config);

    next();
}

module.exports = createDatabaseConnection;