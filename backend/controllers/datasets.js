const util = require("../util/file_management");
const axios = require("axios").default;
const runPython = require("../util/python_config");
const datasets = require("../models/datasets");
const FlexSearch = require("flexsearch");

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
    const data = util.readJSON(newName.replace(extension, "json"), false)

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

    // If the user of this dataset does not match the user, throw error
    if (!name.includes(username)) {
        throw new Error(`User ${ username } is not the owner of this dataset`);
    }

    // Upload metadata
    await model.createMetadata(name, username, metadata);
    // Upload all columns
    const path = `files/uploads/${ name }.json`;
    const data = util.readJSON(path);
    await model.addCols(name, Object.keys(data[0]));
    // Upload text columns
    await model.addTextCols(name, textCols);
    // Upload tags
    if (tags && tags.length > 0) {
        await model.addTag(name, tags);
    }
    
    // Upload raw data to s3
    await runPython("python/upload_dataset.py", [ name, path.replace(".json", ".csv") ], metadata.distributed);

    // DELETE THIS ONCE PREPROCESSING IS RUNNING ON A REMOTE SERVER
    // Begin preprocessing
    await runPython("python/preprocessing.py", [ name ], metadata.distributed);
}

// Add a tag for a dataset
const addTag = async(knex, user, table, tags) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
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

    // If the user of this table does not match the user, throw error
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

// Like a dataset
const addLike = async(knex, user, table) => {
    const model = new datasets(knex);

    await model.addLike(user, table);
}

// Update a dataset's metadata
const updateMetadata = async(knex, user, table, params) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
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

// Update the text of a dataset
const updateText = async(knex, table, params) => {
    const model = new datasets(knex);

    // Get metadata to check if the dataset is in a distributed connection
    const metadata = await model.getMetadata(table);

    // Run python program to replace text
    const paramsFile = `files/python/input/${ table }_${ Date.now() }.json`
    util.generateJSON(paramsFile, params);
    await runPython("python/update_text.py", [table, paramsFile], metadata.distributed);

    // Delete all files for this dataset to reset them
    util.deleteDatasetFiles(table);
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
    const results = names.map(x => x.col).filter(x => textCols.indexOf(x) === -1);
    return results;
}

// Get unique values in a dataset column
const getColumnValues = async(knex, table, column) => {
    const model = new datasets(knex);

    // Get metadata to check for a distributed connection
    const metadata = await model.getMetadata(table);
    // Download dataset from s3
    const data = await util.downloadDataset(table, metadata.distributed, dataset = true);
    // Return unique values in given column
    return [ ...new Set(data.dataset.map(x => x[column])) ];
}

// Get filtered datasets
const getFilteredDatasets = async(knex, query, username, page) => {
    const model = new datasets(knex);

    const results = await model.getFilteredDatasets(query, username, true, page);
    // Get tags and likes for search results
    for (let i = 0; i < results.length; i++) {
        results[i].tags = await getTags(knex, results[i].table_name);
        if (username) {
            results[i].liked = await model.getLike(username, results[i].table_name);
        } else {
            results[i].liked = false;
        }
        results[i].likes = await model.getLikeCount(results[i].table_name);
    }

    return results;
}

// Get count of dataset filter
const getFilteredDatasetsCount = async(knex, query, username) => {
    const model = new datasets(knex);

    const result = await model.getFilteredDatasetsCount(query, username);
    return result;
}

// Get the 2 letter language code for a given language
const getLanguage = async(language) => {
    if (language === "Chinese") {
        return "zh";
    } else if (language === "English") {
        return "en";
    } else if (language === "French") {
        return "fr";
    } else if (language === "German") {
        return "de";
    } else if (language === "Greek") {
        return "el";
    } else if (language === "Italian") {
        return "it";
    } else if (language === "Latin") {
        return "la";
    } else if (language === "Portuguese") {
        return "pt";
    } else if (language === "Russian") {
        return "ru";
    } else if (language === "Spanish") {
        return "es";
    } else {
        throw new Error(`Unknown language: ${ language }`);
    }
}

// Get a subset of a table
const getSubset = async(knex, table, query, user = undefined, page = 1, pageLength = 50) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.username !== user.username)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Check if subset has already been saved
    const filename = `files/subsets/${ table }_${ JSON.stringify(query).substring(0, 245) }.json`;
    let fullOutput = [];
    let columns = [];
    if (util.fileExists(filename)) {
        fullOutput = util.readJSON(filename, false);
        columns = Object.keys(fullOutput[0]);
    } else {
        // If subset has not already been saved, create subset
        // Download data from s3
        const data = await util.downloadDataset(table, metadata.distributed, dataset = true);
        columns = Object.keys(data.dataset[0]);

        if (query.simpleSearch) {
            // Filter if query is defined
            // Configure parser to search dataset
            const index = new FlexSearch.Document({
                document: {
                    id: "__id__",
                    index: columns
                },
                language: getLanguage(metadata.language),
                tokenize: "forward"
            });
            data.dataset.forEach((row, i) => index.add({ ...row, __id__: i }));

            // Filter dataset
            const result = index.search(query.simpleSearch);

            // Get records from search result
            const ids = [ ...new Set(...result.map(x => x.result)) ];
            fullOutput = ids.map(i => { return { ...data.dataset[i], __id__: i } });
        } else {
            // If query is not defined, return everything
            fullOutput = data.dataset.map((x, i) => { return { ...x, __id__: i } });
        }
        
        // Output results to local file
        util.generateJSON(filename, fullOutput);
    }
    
    // Return requested page
    const start = pageLength * (page - 1);
    const end = pageLength + start;
    const data = fullOutput.slice(start, end);
    return {
        columns,
        data,
        count: fullOutput.length
    };
}

// Download a subset of a dataset
const downloadSubset = async(knex, table, query, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.username !== user.username)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Check if subset has already been saved
    const filename = `files/subsets/${ table }_${ JSON.stringify(query).substring(0, 245) }.json`;
    let fullOutput;
    if (util.fileExists(filename)) {
        fullOutput = util.readJSON(filename, false);
    } else {
        // If subset has not already been saved, create subset
        // Download data from s3
        const data = await util.downloadDataset(table, metadata.distributed, dataset = true);

        if (query.simpleSearch) {
            // Filter if query is defined
            // Configure parser to search dataset
            const index = new FlexSearch.Document({
                document: {
                    id: "__id__",
                    index: Object.keys(data.dataset[0])
                },
                language: getLanguage(metadata.language),
                tokenize: "forward"
            });
            data.dataset.forEach((row, i) => index.add({ ...row, __id__: i }));

            // Filter dataset
            const result = index.search(query.simpleSearch);

            // Get records from search result
            const ids = [ ...new Set(...result.map(x => x.result)) ];
            fullOutput = ids.map(x => data.dataset[x]);
        } else {
            // If query is not defined, return everything
            fullOutput = [ ...data.dataset ];
        }
        
        // Output results to local file
        util.generateJSON(filename, fullOutput);
    }

    const newFilename = `files/downloads/${ table }_${ JSON.stringify(query).substring(0, 245) }.json`;
    await util.generateCSV(newFilename, fullOutput);
    return newFilename;
}

// Get dataset records by ids
const getRecordsByIds = async(knex, table, ids, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.username !== user.username)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    const data = await util.downloadDataset(table, metadata.distributed, dataset = true);
    
    return ids.map(i => { return { ...data.dataset[i], __id__: i } });
}

// Get dataset records by ids
const downloadIds = async(knex, table, ids, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.username !== user.username)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    const data = await util.downloadDataset(table, metadata.distributed, dataset = true);
    
    const fullOutput = ids.map(x => data.dataset[x]);
    const newFilename = `files/downloads/${ table }_${ Date.now() }.csv`;
    await util.generateCSV(newFilename, fullOutput);
    return newFilename;
}

// Get the unique parts of speech in a dataset
const getUniquePos = async(knex, dataset, user = undefined) => {
    const model = new datasets(knex);

    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await model.getMetadata(dataset);
    if (!metadata.is_public && (!user || metadata.username !== user.username)) {
        throw new Error(`User ${ user.username } does not have access to the dataset ${ dataset }`);
    }

    // Download dataset tokens
    const data = await util.downloadDataset(dataset, metadata.distributed, dataset = false, tokens = true);

    // Return unique values from pos column
    return [ ...new Set(data.tokens.map(x => x.pos)) ];
}

// Delete a dataset and its metadata
const deleteDataset = async(knex, user, table) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (metadata.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    // Delete datasets from s3
    await runPython("python/delete_dataset.py", [table], metadata.distributed);

    // Delete metadata
    // This will delete tags and columns via cascade
    await model.deleteMetadata(table);

    // Delete local files for dataset
    util.deleteDatasetFiles(table);

    return null;
}

// Delete the given tag for the given dataset
const deleteTag = async(knex, user, table, tag) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await model.deleteTag(table, tag);

    return null;
}

// Unlike a dataset
const deleteLike = async(knex, user, table) => {
    const model = new datasets(knex);

    await model.deleteLike(user, table);
}

module.exports = {
    createDataset,
    createDatasetAPI,
    uploadDataset,
    addTag,
    addTextCols,
    updateMetadata,
    incClicks,
    updateText,
    addLike,
    getMetadata,
    getSubset,
    downloadSubset,
    getUniqueTags,
    getTags,
    getTextCols,
    getColumnNames,
    getColumnValues,
    getFilteredDatasets,
    getFilteredDatasetsCount,
    getRecordsByIds,
    getUniquePos,
    downloadIds,
    deleteDataset,
    deleteTag,
    deleteLike
};