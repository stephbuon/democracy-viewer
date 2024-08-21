const files = require("../util/file_management");
const runPython = require("../util/python_config");
require('dotenv').config();
const s3 = require("../util/s3");
const pl = require("nodejs-polars");

const datasets = require("../models/datasets");

// Generate the data for a graph based on user input
const createGraph = async(knex, dataset, params, user = null) => {
    const model = new datasets(knex);

    // If file for graph already exists, skip calculations
    const file1 = "files/python/input/" + dataset + "_" + JSON.stringify(params).substring(0, 245) + ".json";
    const file2 = file1.replace("/input/", "/output/");
    if (files.fileExists(file2)) {
        return files.readJSON(file2, false)
    }

    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await model.getMetadata(dataset);
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user.email } does not have access to the dataset ${ dataset }`);
    }

    params.table_name = dataset;
    // Convert params.group_list and params.word_list to arrays if they aren't already
    params.group_list = Array.isArray(params.group_list) ? params.group_list : params.group_list ? [ params.group_list ] : [];
    params.word_list = Array.isArray(params.word_list) ? params.word_list : params.word_list ? [ params.word_list ] : [];
    // Convert pos attribute to boolean
    params.pos = !params.pos || params.pos === "false" ? false : true;

    // Create input file with data for python program
    files.generateJSON(file1, params);

    // Run python program that generates graph data
    await runPython("graphs", [ file1 ], metadata.distributed);
   
    // Read python output files and return results
    return files.readJSON(file2, false);
}

// Get the ids of records the match the given words and/or groups
const getIds = async(knex, table, params, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user.email } is not the owner of this dataset`);
    }

    // Download tokens from s3
    const dataScan = await s3.scanDataset("datasets", metadata);
    const tokenScan = await s3.scanDataset("tokens", metadata);
    
    params.group_list = Array.isArray(params.group_list) ? params.group_list : params.group_list ? [ params.group_list ] : [];
    params.word_list = Array.isArray(params.word_list) ? params.word_list : params.word_list ? [ params.word_list ] : [];

    let rawIds = [];
    if (params.group_name && params.group_list.length > 0) {
        dataScan = dataScan
            .filter(pl.col(params.group_name).isIn(params.group_list));
    }
    rawIds = dataScan
        .select("record_id")
        .collectSync()
        .getColumn("record_id")
        .toArray();

    let splitIds = [];
    if (params.word_list.length > 0) {
        tokenScan = tokenScan
            .filter(pl.col("word").isIn(params.word_list))
    }
    splitIds = tokenScan
        .select("record_id")
        .collectSync()
        .getColumn("record_id")
        .unique()
        .toArray();

    return rawIds.filter(x => splitIds.includes(x));
}

module.exports = {
    createGraph,
    getIds
}