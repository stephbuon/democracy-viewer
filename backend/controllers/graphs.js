const files = require("../util/file_management");
const python = require("python-shell").PythonShell;
const { encodeConnection } = require("./databases");
const { defaultConfig } = require("../util/database_config");
require('dotenv').config();

const datasets = require("../models/datasets");

// Generate the data for a graph based on user input
const createGraph = async(knex, dataset, params, user = null) => {
    const model = new datasets(knex);

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
    const file1 = "python/files/input/" + dataset + "_" + Date.now() + ".json";
    files.generateJSON(file1, params);

    // Add file names as command line arguments
    const options = {
        args: [ file1 ]
    }

    // If distributed connection, add encoded token to args
    if (user && user.database) {
        const token = await encodeConnection(require("knex")(defaultConfig()), user.database);
        options.args.push(token);
    }
    
    // If a python path is provided in .env, use it
    // Else use the default path
    if (process.env.PYTHON_PATH) {
        options["pythonPath"] = process.env.PYTHON_PATH;
    }

    // Run python program that generates graph data
    try {
        await python.run("python/graphs.py", options).then(x => console.log(x)).catch(x => {
            console.log(x);
            throw new Error(x);
        });
        files.deleteFiles([ file1 ]);
    } catch(err) {
        if (!files.fileExists(file1.replace("/input/", "/output/"))) {
            files.deleteFiles([ file1 ]);
            throw new Error(err);
        } else {
            console.log(err)
        }
    }
   
    // Read python output files and return results
    const file2 = file1.replace("/input/", "/output/");
    return files.readJSON(file2);
}

module.exports = {
    createGraph
}