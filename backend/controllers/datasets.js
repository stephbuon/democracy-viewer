const util = require("../util/file_management");

// Upload a new dataset from a csv file
const createDataset = async(datasets, path) => {
    // Parse the provided csv file
    const data = util.readCSV(path);

    // Get the file name from the file path
    let name = path.split("/");
    name = name[name.length - 1].split(".");
    name = name[0];

    // Create a new table with the file name and column names
    await datasets.createDataset(name, Object.keys(data[0]));

    // Loop through the data and insert rows
    for (let i = 0; i < data.length; i++) {
        await datasets.addRow(name, data[i]);
    }

    // Return the first 10 rows of the new dataset and the table name
    const results = await datasets.getHead(name);
    const output = {
        table_name: name,
        data: results
    }
    return output;
}

// Create the initial metadata for a dataset
const createMetadata = async(datasets, username, body) => {
    // Add username to parameters
    const params = { ...body, username };
    const record = await datasets.createMetadata(params);
    return record;
}

// Add a tag for a dataset
const addTag = async(datasets, user, table, tag) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error("Logged in user is not the owner of this dataset");
    }

    // Add tag to db
    const record = await datasets.addTag(table, tag);
    return record;
}

// Change the data type of a column in a dataset
const changeColType = async(datasets, table, column, type) => {
    // Change the column in db
    await datasets.changeColType(table, column, type);
    // Get the first 10 rows of the dataset
    const results = datasets.getHead(table);
    return results;
}

// Update a dataset's metadata
const updateMetadata = async(datasets, user, table, params) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error("Logged in user is not the owner of this dataset");
    }

    // Update metadata record
    const record = await datasets.updateMetadata(table, params);
    return record;
}

// Get unique tags
const getUniqueTags = async(datasets) => {
    // Get tag names from table
    const records = await datasets.getUniqueTags();
    // Convert objects to strings with tag names
    const results = records.map(x => x.tag_name);
    return results;
} 

// Get tags by dataset
const getTags = async(datasets, table) => {
    // Get tag names from table
    const records = await datasets.getTags(table);
    // Convert objects to strings with tag names
    const results = records.map(x => x.tag_name);
    return results;
} 

// Download a csv with all records from a dataset
const downloadDataset = async(datasets, table) => {
    // Clear the downloads folder on the server
    util.clearDirectory("./downloads/");
    // Get all records in this dataset
    const records = await datasets.getDataset(table);
    // Generate csv from records
    const fileName = util.generateCSV(`./downloads/${ table }`, records);
    // Return generated file name
    return fileName;
}

// Download a subset of a dataset
const downloadSubset = async(datasets, table, params) => {
    // Clear the downloads folder on the server
    util.clearDirectory("./downloads/");
    // Get all records in this dataset
    const records = await datasets.subsetTable(table, params);
    // Generate csv from records
    const fileName = util.generateCSV(`./downloads/${ table }`, records);
    // Return generated file name
    return fileName;
}

// Delete a dataset and its metadata
const deleteDataset = async(datasets, user, table) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error("Logged in user is not the owner of this dataset");
    }

    await datasets.deleteTable(table);
    await datasets.deleteMetadata(table);

    return null;
}

// Delete the given tag for the given dataset
const deleteTag = async(datasets, user, table, tag) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error("Logged in user is not the owner of this dataset");
    }

    await datasets.deleteTag(table, tag);

    return null;
}

module.exports = {
    createDataset,
    createMetadata,
    addTag,
    changeColType,
    updateMetadata,
    downloadDataset,
    downloadSubset,
    getUniqueTags,
    getTags,
    deleteDataset,
    deleteTag
};