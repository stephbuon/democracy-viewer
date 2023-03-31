const knexConfig = require('../knexfile');
const knex = require('knex');
const { attachPaginate } = require("knex-paginate");
attachPaginate();
module.exports = knex(knexConfig.development);