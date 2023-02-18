const fs = require("fs");

// Upload a new dataset from a csv file
const createDataset = async(datasets, path) => {
    // Parse the provided csv file
    const data = readCSV(path);

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

// Read a csv file
const readCSV = (path) => {
    // Read file an split into rows
    const fileContents = fs.readFileSync(path, { encoding: 'utf-8' });
    let rows = fileContents.split("\n");
    // Split rows by commas
    rows = rows.map(x => x.split(","));

    // Get column names from first row
    const names = [];
    for (let i = 0; i < rows[0].length; i++) {
        names.push(rows[0][i].replace("\r", ""));
    }

    // Collect data from the rest of the rows
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        // Create object with current row data
        const curr = {};
        for (let j = 0; j < rows[i].length; j++) {
            // If rows[i][j] is an empty string, end loop
            if (!rows[i][j]) {
                break;
            } 
            curr[names[j]] = rows[i][j].replace("\r", "");
        }
        // If curr is not empty, add to data
        if (Object.keys(curr).length > 0) {
            data.push(curr);
        }
    }

    // Delete file once read
    fs.unlinkSync(path);

    return data;
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
    getUniqueTags,
    getTags,
    deleteDataset,
    deleteTag
};