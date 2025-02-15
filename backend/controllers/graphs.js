const files = require("../util/file_management");
const runPython = require("../util/python_config");
require('dotenv').config();
const dataQueries = require("../util/data_queries");
const aws = require("../util/aws");
const crypto = require('crypto');
const datasets = require("../models/datasets");
const graphs = require("../models/graphs");

// Get the url to upload a graph to S3
const publishGraph = async(knex, settings, user) => {
    const model = new datasets(knex);

    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await model.getMetadata(settings.table_name);
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user.email } does not have access to the dataset ${ settings.table_name }`);
    }

    // Add user to the settings
    settings.user = user.email;
    // Hash the settings to get a unique id
    const hashedSettings = crypto.createHash('md5').update(JSON.stringify(settings)).digest('hex');

    // Upload the settings
    const settingsFile = `files/graphs/${ hashedSettings }.json`;
    files.generateJSON(settingsFile, settings);
    await aws.uploadFile(settingsFile, `graphs/${ hashedSettings }/settings.json`);

    // Get the signed url to upload graph image
    const signedUrl = await aws.uploadGraph(hashedSettings);

    // Return signed url and unique id
    return {
        id: hashedSettings,
        url: signedUrl
    }
}

// Add metadata for the graph
const addMetadata = async(knex, params, user) => {
    const model_graphs = new graphs(knex);
    const model_datasets = new datasets(knex);

    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await model_datasets.getMetadata(params.table_name);
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user.email } does not have access to the dataset ${ params.table_name }`);
    }

    // Verify that the graph exists with the given id
    const graphPath = `graphs/${ params.s3_id }/graph.png`;
    const graphExists = await aws.checkFileExists(graphPath);
    if (!graphExists) {
        throw new Error(`No graph has been uploaded with the id '${ params.s3_id }'`);
    }

    // Upload metadata to s3
    return await model_graphs.createMetadata(user.email, params);
}

// Generate the data for a graph based on user input
const createGraph = async(knex, dataset, params, user = null) => {
    const model = new datasets(knex);

    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await model.getMetadata(dataset);
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user.email } does not have access to the dataset ${ dataset }`);
    }

    params.table_name = dataset;
    // Convert params.group_list and params.word_list to arrays if they aren't already
    params.group_list = Array.isArray(params.group_list) ? params.group_list.sort() : params.group_list ? [ params.group_list ] : [];
    params.word_list = Array.isArray(params.word_list) ? params.word_list.sort() : params.word_list ? [ params.word_list ] : [];
    // Convert pos attribute to boolean
    params.pos = !params.pos || params.pos === "false" ? false : true;

    // If file for graph already exists, skip calculations
    const paramsString = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
    const file1 = `files/python/input/${ paramsString }.json`;
    const file2 = file1.replace("/input/", "/output/");
    if (files.fileExists(file2)) {
        return files.readJSON(file2, false)
    }

    // Create input file with data for python program
    files.generateJSON(file1, params);

    // Run python program that generates graph data
    await runPython("graphs", [ file1 ], metadata.distributed);
   
    // Read python output files and return results
    return files.readJSON(file2, false);
}

// Get the ids of records the match the given words and/or groups
const getZoomIds = async(knex, table, params, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if ((!metadata || !metadata.is_public) && (!user || metadata.email !== user.email)) {
        throw new Error(`User is not the owner of this dataset`);
    }
    
    params.group_list = Array.isArray(params.group_list) ? params.group_list.sort() : params.group_list ? [ params.group_list ] : [];
    params.word_list = Array.isArray(params.word_list) ? params.word_list.sort() : params.word_list ? [ params.word_list ] : [];

    const paramsString = crypto.createHash('md5').update(JSON.stringify({
        table_name: table,
        group_name: params.group_name,
        group_list: params.group_list,
        word_list: params.word_list
    })).digest('hex');
    const fileName = `files/zoom/${ paramsString }.json`;

    let count;
    if (!files.fileExists(fileName)) {
        const scan = await dataQueries.getZoomIds(table, params);
        const ids = scan
            .collectSync()
            .getColumn("record_id")
            .toArray();

        files.generateJSON(fileName, ids);
        count = ids.length;
    } else {
        const data = files.readJSON(fileName, false);
        count = data.length;
    }

    return {
        name: paramsString,
        count
    };
}

// Get the paginated records for a set of ids
const getZoomRecords = async(knex, table, params, user = undefined) => {
    const model = new datasets(knex);

    // Throw an error if the name of the zoom ids file was not provided
    if (!params.name) {
        throw new Error("Zoom ids not defined");
    }

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if ((!metadata || !metadata.is_public) && (!user || metadata.email !== user.email)) {
        throw new Error(`User is not the owner of this dataset`);
    }

    const fileName = `files/zoom/${ params.name }.json`;
    const page = params.page ? params.page : 1;
    const pageLength = params.pageLength ? params.pageLength : 10;
    const start = pageLength * (page - 1);
    const end = pageLength * page;

    // Throw error if file does not exist
    if (!files.fileExists(fileName)) {
        throw new Error(`Zoom ids no longer loaded with filename "${ fileName }"`);
    }

    // Load paginated ids from file
    const data = files.readJSON(fileName, false);
    const ids = data.slice(start, end);
    // Get records by ids
    const scan = await dataQueries.getRecordsByIds(table, ids);
    const df = scan
        .collectSync()
        .toRecords();

    return df;
}

module.exports = {
    publishGraph,
    addMetadata,
    createGraph,
    getZoomIds,
    getZoomRecords
}