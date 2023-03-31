const util = require("../util/file_management");

// Upload a new dataset from a csv file
const createDataset = async(datasets, path) => {
    // Parse the provided csv file
    return await util.readCSV(path).then(async(data) => {
        // Get the file name from the file path
        let name = path.split("/");
        name = name[name.length - 1].split(".");
        name = name[0] + "_" + Date.now();

        // Split any values with over 8000 characters into multiple records
        for (let i = 0; i < data.length; i++) {
            let keys = [];
            Object.keys(data[i]).forEach(key => {
                if (data[i][key].length > 4000) {
                    keys.push(key);
                }
            });

            if (keys.length > 0) {
                const newRecord = { ...data[i] };
                keys.forEach(key => {
                    data[i][key] = data[i][key].substring(0, 4000);
                    newRecord[key] = data[i][key].substring(4000, data[i][key].length);
                });
                data.splice(i + 1, 0, newRecord);
            }
        }
    
        // Determine the maximum length for each column
        const maxLengths = {};
        data.map((row) => {
            Object.keys(row).forEach(key => {
                if (!maxLengths[key] || row[key].length > maxLengths[key]) {
                    maxLengths[key] = row[key].length;
                }
            });
        });
    
        // Create a new table with the file name and column names
        await datasets.createDataset(name, Object.keys(data[0]), maxLengths);
    
        // Loop through the data and insert rows
        for (let i = 0; i < data.length; i += 10000) {
            await datasets.addRows(name, data.slice(i, i + 10000));
        }
    
        // Return the first 10 rows of the new dataset and the table name
        const results = await datasets.getHead(name);
        const output = {
            table_name: name,
            data: results
        }
        return output;
    });
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
    const records = await datasets.getSubset(table, {}, false);
    // Generate csv from records
    const fileName = await util.generateCSV(`./downloads/${ table }_${ Date.now() }.csv`, records);
    // Return generated file name
    return fileName;
}

// Download a subset of a dataset
const downloadSubset = async(datasets, table, params) => {
    // Clear the downloads folder on the server
    util.clearDirectory("./downloads/");
    // Get all records in this dataset
    const records = await datasets.subsetTable(table, params, false);
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