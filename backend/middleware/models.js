// Import models
const datasets = require("../models/datasets");
const graphs = require("../models/graphs");
const groups = require("../models/groups");
const preprocessing = require("../models/preprocessing");
const users = require("../models/users");

const createModelsMiddleware = async (req, res, next) => {
    req.models = {
        datasets: new datasets,
        graphs: new graphs,
        groups: new groups,
        preprocessing: new preprocessing,
        users: new users
    }
    next();
}

const disconnectFromDatababaseMiddleware = (req, res, next) => {
    console.log('Disconnecting from the database');
    req.disconnect();
    next();
}

module.exports = {
    createModelsMiddleware,
    disconnectFromDatababaseMiddleware
}