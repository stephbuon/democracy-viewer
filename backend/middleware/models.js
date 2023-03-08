// Import models
const datasets = require("../models/datasets");
const groups = require("../models/groups");
const users = require("../models/users");

const createModelsMiddleware = async (req, res, next) => {
    req.models = {
        datasets: new datasets,
        groups: new groups,
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