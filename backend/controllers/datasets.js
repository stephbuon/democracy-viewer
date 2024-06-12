const util = require("../util/file_management");
const axios = require("axios").default;
const runPython = require("../util/python_config");
const datasets = require("../models/datasets"); 

// Upload a new dataset from a csv file
const createDataset = async(path, username) => {
    // Get the file name from the file path
    let filepath = path.split("/");
    const comps = filepath.pop().split(".");
    filepath = filepath.join("/");
    const extension = comps.pop();
    const name = comps[comps.length - 1].replace(extension, "");
    const table_name = `${ name }_${ username }_${ Date.now() }`;
    const newName = `${ filepath }/${ table_name }.${ extension }`;
    // Rename file
    util.renameFile(path, newName);

    // Get the first 5 records from the dataset
    await runPython("python/get_head.py", [ newName ]);
    const data = util.readJSON(newName.replace(extension, "json"))

    return {
        table_name,
        data
    };
}

// Import a new dataset from an api
const createDatasetAPI = async(endpoint, username, token = null) => {
    // Add token if passed
    let apiConfig = {};
    if (token) {
        apiConfig = {
            headers: {
                Authorization: `Bearer ${ token }`
            }
        }
    }

    // Get the data from the api
    const res = await axios.get(endpoint, apiConfig);
    // If the request failed, throw an error
    if (res.status !== 200) {
        throw new Error(`External API status code ${ res.status }: ${ res.statusText }`);
    }
    // If the request succeeded, store data
    const data = res.data;

    // Create table name and file name using user's username
    const name = `${ username }_${ Date.now() }`;
    const filename = `files/uploads/${ username }.csv`;
    
    let output = {};
    if (typeof data === "string") {
        // Export data to csv using a string
        util.generateFile(filename, data);
        // Parse file to read first 5 records and return
        const records = await util.readCSV(filename, false);
        // Slice first 5 records to return
        output = {
            table_name: name,
            data: records.slice(0, 5)
        }
    } else if (typeof data === "object") {
        // Export data to csv file using an object
        await util.generateCSV(filename, data);
        // Slice first 5 records to return
        output = {
            table_name: name,
            data: data.slice(0, 5)
        }
    } else {
        // If the request data is not in the correct format, throw an error
        throw new Error(`Type ${ typeof data } is not valid`);
    }

    return output;
}

// Upload dataset records using Python
const uploadDataset = async(knex, name, metadata, textCols, tags, user) => {
    const model = new datasets(knex);

    // Extract username from user
    const username = user.username;

    // If the user of this dataset does not match the user making the updates, throw error
    if (!name.includes(username)) {
        throw new Error(`User ${ username } is not the owner of this dataset`);
    }

    // Upload metadata
    await model.createMetadata(name, username, metadata);
    // Upload text columns
    await model.addTextCols(name, textCols);
    // Upload tags
    await model.addTag(name, tags);

    // Upload raw data to s3
    const path = `files/uploads/${ name }.csv`;
    await runPython("python/upload_dataset.py", [ name, path ], user.database)

    // DELETE THIS ONCE PREPROCESSING IS RUNNING ON A REMOTE SERVER
    // Begin preprocessing
    await runPython("python/preprocessing.py", [ name ], user.database)
}

// Add a tag for a dataset
const addTag = async(knex, user, table, tags) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    // If cols is not an array, make it an array
    if (!Array.isArray(tags)) {
        tags = [ tags ];
    }

    // Add tags to db
    await model.addTag(table, tags);

    // Return all tags for this dataset
    const records = await getTags(knex, table);
    return records;
}

// Add text column(s) for a dataset
const addTextCols = async(knex, user, table, cols) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    // If cols is not an array, make it an array
    if (!Array.isArray(cols)) {
        cols = [ cols ];
    }

    // Add data to db
    await model.addTextCols(table, cols);

    // Return all text columns for this dataset
    const records = await getTextCols(knex, table);
    return records;
}

// Update a dataset's metadata
const updateMetadata = async(knex, user, table, params) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Update metadata record
    const record = await model.updateMetadata(table, params);
    return record;
}

// Increment a dataset's clicks
const incClicks = async(knex, table) => {
    const model = new datasets(knex);

    const result = await model.incClicks(table);
    return result;
}

// Get dataset metadata
const getMetadata = async(knex, table) => {
    const model = new datasets(knex);

    const result = await model.getMetadata(table);
    return result;
}

// Get unique tags
const getUniqueTags = async(knex) => {
    const model = new datasets(knex);

    // Get tag names from table
    const records = await model.getUniqueTags();
    // Convert objects to strings with tag names
    const results = records.map(x => x.tag_name);
    return results;
} 

// Get tags by dataset
const getTags = async(knex, table) => {
    const model = new datasets(knex);

    // Get tag names from table
    const records = await model.getTags(table);
    // Convert objects to strings with tag names
    const results = records.map(x => x.tag_name);
    return results;
} 

// Get text columns by dataset
const getTextCols = async(knex, table) => {
    const model = new datasets(knex);

    // Get col names from table
    const records = await model.getTextCols(table);
    // Convert objects to strings with col names
    const results = records.map(x => x.col);
    return results;
}

// Get dataset column names (excluding text columns)
const getColumnNames = async(knex, table) => {
    const model = new datasets(knex);

    // Get all column names
    const names = await model.getColumnNames(table);
    // Get text columns
    const textCols = await getTextCols(knex, table);
    // Filter out text columns
    const results = names.map(x => x.col).filter(textCols.indexOf(x) === -1);
    return results;
}

// Get unique values in a dataset column
const getColumnValues = async(table, column) => {
    const data = await util.downloadDataset(table, dataset = true);
    return [ ...new Set(data.dataset.map(x => x[column])) ];
}

// Get filtered datasets
const getFilteredDatasets = async(knex, query, username, page) => {
    const model = new datasets(knex);

    const result = await model.getFilteredDatasets(query, username, true, page);
    return result;
}

// Get count of dataset filter
const getFilteredDatasetsCount = async(knex, query, username) => {
    const model = new datasets(knex);

    const result = await model.getFilteredDatasetsCount(query, username);
    return result;
}

// Get a subset of a table
const getSubset = async(knex, table, query, user = undefined, page = 1, pageLength = 50) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (!metadata.is_public && (!user || metadata.username !== user.username)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    const data = await util.downloadDataset(table, dataset = true);
    
    
}

// Get dataset subset count
const subsetTableCount = async(knex, table, query) => {
    const model = new datasets(knex);

    const result = await model.subsetTableCount(table, query);
    return result;
}

// Download a subset of a dataset
const downloadSubset = async(knex, table, params, username = undefined) => {
    const model = new datasets(knex);

    // Clear the downloads folder on the server
    util.clearDirectory("./files/downloads/");
    // Get all records in this dataset
    const count = await model.subsetTableCount(table, params);
    const pages = Math.ceil(count / 50000);
    params.pageLength = 50000;
    // Add dataset download record and get id
    const downloadId = await model.addDownload(username, table, pages);
    // Get string columns
    const cols = await model.getColumnNames(table);
    const strCols = Object.keys(cols).filter(x => cols[x].type === "varchar");
    let records = [];
    for (let i = 1; i <= pages; i++) {
        let curr = await model.subsetTable(table, params, true, i);
        // Wrap string cols in quotes
        curr = curr.map(x => {
            strCols.forEach(col => {
                x[col] = '"' + x[col] + '"';
            });

            return x;
        });
        records = [ ...records, ...curr ];
        // Update download percentage
        await model.updateDownload(downloadId);
    }
    // Generate csv from records
    const fileName = util.generateCSV(`./files/downloads/${ table }.csv`, records);
    // Delete the download record
    await model.deleteDownload(downloadId);
    // Return generated file name
    return fileName;
}

// Get the percentage of a dataset that has been uploaded to the database
const getUploadPercent = async(knex, table) => {
    const model = new datasets(knex);

    // Get the metadata record
    const metadata = await model.getMetadata(table);
    // Get the number of records in the given table
    const records = await model.subsetTableCount(table, {});
    if (metadata.record_count > 0) {
        // Calculate percentage of records uploaded
        return records / metadata.record_count;
    } else {
        // If record count is 0, throw error
        throw new Error("Number of records is 0");
    }
}

// Get dataset records by ids
const getRecordsByIds = async(knex, table, ids) => {
    const model = new datasets(knex);

    const result = await model.getRecordsByIds(table, ids);
    return result;
}

// Get dataset download record
const getDownload = async(knex, username, table) => {
    const model = new datasets(knex);

    const result = await model.getDownload(username, table);
    return result;
}

// Delete a dataset and its metadata
const deleteDataset = async(knex, user, table) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await model.deleteMetadata(table);

    return null;
}

// Delete the given tag for the given dataset
const deleteTag = async(knex, user, table, tag) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await model.deleteTag(table, tag);

    return null;
}

// Delete a text column fro a dataset
const deleteTextCol = async(knex, user, table, col) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await model.deleteTextCol(table, col);

    return null;
}

module.exports = {
    createDataset,
    createDatasetAPI,
    uploadDataset,
    addTag,
    addTextCols,
    updateMetadata,
    incClicks,
    getMetadata,
    getSubset,
    downloadSubset,
    getUploadPercent,
    getUniqueTags,
    getTags,
    getTextCols,
    getColumnNames,
    getColumnValues,
    getFilteredDatasets,
    getFilteredDatasetsCount,
    subsetTableCount,
    getRecordsByIds,
    getDownload,
    deleteDataset,
    deleteTag,
    deleteTextCol
};