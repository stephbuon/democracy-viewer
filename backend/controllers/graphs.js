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

    // Check if the user has already published this graph
    const graph = await model_graphs.getFilteredGraphs({ s3_id: params.s3_id, user: user.email, pageLength: 1 }, user.email);
    if (graph.total) {
        throw new Error(`User ${ user.email } has already published a graph with these parameters`);
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
    if (!metadata.is_public && (!user || (metadata.email !== user.email && !(await model.hasDatasetAccessGroup(dataset, user.email))))) {
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

// Like a graph
const addLike = async(knex, user, id) => {
    const model = new graphs(knex);

    await model.addLike(user, id);
}

// Update a graph's metadata
const updateMetadata = async(knex, id, params, user) => {
    const model = new graphs(knex);

    // Check metadata to ensure this user has the rights to update this graph
    const oldRecord = await model.getMetadataById(id);
    if (oldRecord.email !== user.email) {
        throw new Error(`User ${ user.email } does not have permission to update this metadata`);
    }

    // Update metadata and return new record
    return await model.updateMetadata(id, params);
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

// Get metadata including data from other columns
const getFullMetadata = async(knex, id, email) => {
    const model = new graphs(knex);

    const result = await model.getMetadataById(id);
    

    // result.tags = await getTags(knex, id);
    if (email) {
        result.liked = await model.getLike(email, id);
    } else {
        result.liked = false;
    }
    result.likes = await model.getLikeCount(id);

    return result;
}

// Get filtered graphs
const getFilteredGraphs = async(knex, query, email, page) => {
    const model = new graphs(knex);

    const results = await model.getFilteredGraphs(query, email, Number(page));
    // Get tags and likes for search results
    for (let i = 0; i < results.length; i++) {
        // results[i].tags = await getTags(knex, results[i].id);
        if (email) {
            results[i].liked = await model.getLike(email, results[i].id);
        } else {
            results[i].liked = false;
        }
        results[i].likes = await model.getLikeCount(results[i].id);
    }

    return results;
}

// Return the settings for a graph based on its id
const getGraphSettings = async(knex, id, user = null) => {
    const model = new graphs(knex);

    // Check if user has permission to view this graph
    const metadata = await model.getMetadataById(id);
    if (!metadata.is_public && metadata.email !== user.email) {
        throw new Error(`User ${ user.email } does not have permission to view this graph`);
    }

    // Download the graph settings from s3
    const localPath = `files/graphs/${ metadata.s3_id }.json`;
    const s3Path = `graphs/${ metadata.s3_id }`;
    await aws.downloadFile(localPath, s3Path, "settings.json");
    // Read downloaded file
    const settings = files.readJSON(localPath, false);

    // Add a view for the graph
    await model.incrementClicks(id);

    // Return graph settings
    return settings;
}

// Get image by id
const getGraphImage = async(knex, id, user = null) => {
    const model = new graphs(knex);

    // Check if user has permission to view this graph
    const metadata = await model.getMetadataById(id);
    if (!metadata.is_public && metadata.email !== user.email) {
        throw new Error(`User ${ user.email } does not have permission to view this graph`);
    }

    // Return signed url to get image
    return await aws.downloadGraph(metadata.s3_id);
}

// Delete graph metadata and graph from s3 if needed
const deleteGraph = async(knex, id, user) => {
    const model = new graphs(knex);

    // Check if user has permission to delete this graph
    const metadata = await model.getMetadataById(id);
    if (metadata.email !== user.email) {
        throw new Error(`User ${ user.email } does not have permission to view this graph`);
    }

    // Check if another graph uses the same s3 id
    const matchingS3 = await model.getGraphsByS3Id(metadata.s3_id);
    // Delete data from s3 if this is the only graph with this s3 id
    if (matchingS3.length == 1) {
        const dirPath = `graphs/${ metadata.s3_id }`;
        const graphPath = `${ dirPath }/graph.png`;
        const settingsPath = `${ dirPath }/settings.json`;
        
        await aws.deleteFile(graphPath);
        await aws.deleteFile(settingsPath);
        await aws.deleteFile(dirPath);
    }

    // Delete metadata record
    await model.deleteMetadataById(id);
}

// Unlike a graph
const deleteLike = async(knex, user, id) => {
    const model = new graphs(knex);

    await model.deleteLike(user, id);
}


module.exports = {
    publishGraph,
    addMetadata,
    createGraph,
    addLike,
    updateMetadata,
    getZoomIds,
    getZoomRecords,
    getFullMetadata,
    getFilteredGraphs,
    getGraphSettings,
    getGraphImage,
    deleteGraph,
    deleteLike
}