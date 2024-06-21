const files = require("../util/file_management");
const { encodeConnection } = require("./databases");
const { defaultConfig } = require("../util/database_config");
const runPython = require("../util/python_config");
require('dotenv').config();

const datasets = require("../models/datasets");

// Generate the data for a graph based on user input
const createGraph = async(knex, dataset, params, user = null) => {
    const model = new datasets(knex);

    // If file for graph already exists, skip calculations
    const file1 = "files/python/input/" + dataset + "_" + JSON.stringify(params) + ".json";
    const file2 = file1.replace("/input/", "/output/");
    if (files.fileExists(file2)) {
        return files.readJSON(file2, false)
    }

    // Check if the provided metrics is valid
    const metrics = [
        "counts",
        "proportion",
        "tf-idf",
        "ll",
        "jsd"
    ];
    if (!metrics.includes(params.metric)) {
        throw new Error(`Invalid metric ${ params.metric }`);
    }

    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await model.getMetadata(dataset);
    if (!metadata.is_public && (!user || metadata.username !== user.username)) {
        throw new Error(`User ${ user.username } does not have access to the dataset ${ dataset }`);
    }

    params.table_name = dataset;
    // Use embed_col as group name if embedding metric
    if (params.metric === "embed") {
        params.group_name = metadata.embed_col;
    }
    // Convert params.group_list and params.word_list to arrays if they aren't already
    params.group_list = Array.isArray(params.group_list) ? params.group_list : params.group_list ? [ params.group_list ] : [];
    params.word_list = Array.isArray(params.word_list) ? params.word_list : params.word_list ? [ params.word_list ] : [];

    // Create input file with data for python program
    files.generateJSON(file1, params);

    // Run python program that generates graph data
    await runPython("python/graphs.py", [ file1 ], metadata.distributed);
   
    // Read python output files and return results
    return files.readJSON(file2, false);
}

module.exports = {
    createGraph
}