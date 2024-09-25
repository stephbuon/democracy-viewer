const util = require("../util/file_management");
const axios = require("axios").default;
const runPython = require("../util/python_config");
const datasets = require("../models/datasets");
const { getName } = require("../util/user_name");
const emails = require("../util/email_management");
const dataQueries = require("../util/data_queries");
const aws = require("../util/aws");

// Upload a new dataset from a csv file
const createDataset = async(path, email) => {
    // Get the file name from the file path
    let filepath = path.split("/");
    const extension = filepath.pop().split(".").pop();
    filepath = filepath.join("/");
    const table_name = `${ email.replace(/\W+/g, "_") }_${ Date.now() }`;
    const newName = `${ filepath }/${ table_name }.${ extension }`;
    // Rename file
    util.renameFile(path, newName);

    // Get column names
    const headers = await util.getCsvHeaders(newName);

    return {
        table_name,
        headers
    };
}

// Import a new dataset from an api
const createDatasetAPI = async(endpoint, email, token = null) => {
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

    // Create table name and file name using user's email
    const name = `${ email.replace(/\W+/g, "_") }_${ Date.now() }`;
    const filename = `files/uploads/${ email.replace(/\W+/g, "_") }.csv`;
    
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

    // Extract email from user
    const email = user.email;

    // If the user of this dataset does not match the user, throw error
    if (!name.includes(email.replace(/\W+/g, "_"))) {
        throw new Error(`User ${ email } is not the owner of this dataset`);
    }

    // Upload metadata
    await model.createMetadata(name, email, metadata);
    // Upload all columns
    const path = `files/uploads/${ name }.csv`;
    const headers = await util.getCsvHeaders(path);
    await model.addCols(name, headers);
    // Upload text columns
    await model.addTextCols(name, textCols);
    // Upload tags
    if (tags && tags.length > 0) {
        await model.addTag(name, tags);
    }
    
    // Upload raw data to s3
    await runPython("upload_dataset", [ name, path ], metadata.distributed);

    // Set dataset as uploaded
    // await model.updateMetadata(name, { uploaded: true });

    // Start batch preprocessing
    await aws.submitBatchJob(name);
}

// Add a tag for a dataset
const addTag = async(knex, user, table, tags) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
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
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
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

// Add a text suggestions
const addSuggestion = async(knex, user, params) => {
    const model = new datasets(knex);

    const post_date = new Date();
    const suggestion = await model.addSuggestion(user, { ...params, post_date });
    
    // Send an email to the owner of the dataset
    const curr = await model.getMetadata(suggestion.table_name);
    await emails.suggestionEmail(
        knex, curr.email, suggestion.email, curr.title,
        suggestion.old_text, suggestion.new_text, suggestion.id, "add"
    );
}

// Update a dataset's metadata
const updateMetadata = async(knex, user, table, params) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
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
const updateText = async(knex, id, user) => {
    const model = new datasets(knex);

    const suggestion = await model.getSuggestion(id);
    const curr = await model.getMetadata(suggestion.table_name);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Run python program to replace text
    const paramsFile = `files/python/input/${ suggestion.table_name }_${ Date.now() }.json`
    util.generateJSON(paramsFile, suggestion);
    await runPython("update_text", [paramsFile], curr.distributed);

    // Update updates count
    await model.incUpdates(suggestion.table_name);

    // Send an email to the person who made the suggestion
    await emails.suggestionEmail(
        knex, suggestion.email, curr.email, curr.title,
        suggestion.old_text, suggestion.new_text, suggestion.id, "confirm"
    );

    // Delete all files for this dataset to reset them
    util.deleteDatasetFiles(suggestion.table_name);
    // Delete the suggestion record
    await model.deleteSuggestionById(id);
}

// Get dataset metadata
const getMetadata = async(knex, table) => {
    const model = new datasets(knex);

    const result = await model.getMetadata(table);
    return result;
}

// Get metadata including data from other columns
const getFullMetadata = async(knex, table, email) => {
    const model = new datasets(knex);

    const result = await getMetadata(knex, table);

    result.tags = await getTags(knex, table);
    if (email) {
        result.liked = await model.getLike(email, result.table_name);
    } else {
        result.liked = false;
    }
    result.likes = await model.getLikeCount(result.table_name);

    return result;
}

// Get unique tags
const getUniqueTags = async(knex, query) => {
    const model = new datasets(knex);

    // Get tag names from table
    const records = await model.getUniqueTags(query.search, query.page, query.pageLength);
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
    const results = names.map(x => x.col).filter(x => !textCols.includes(x));
    return results;
}

// Get unique values in a dataset column
const getColumnValues = async(knex, table, column, search = undefined, page = 1, pageLength = 10) => {
    const model = new datasets(knex);

    // Get metadata to check for a distributed connection
    const metadata = await model.getMetadata(table);

    // Check to see if cache of values exists
    const path = `files/nodejs/values/${ table }_${ column }.json`;
    let data;
    if (util.fileExists(path)) {
        // If file already exists, load data from file
        data = util.readJSON(path, false);
    } else {
        // Else, download dataset from S3
        const scan = await dataQueries.uniqueColValues(metadata.table_name, column);
        data = scan
            .collectSync()
            .getColumn(column)
            .unique()
            .toArray();

        // Store cache of data
        util.generateJSON(path, data);
    }

    // Filter and grab first 10 results
    const start = pageLength * (page - 1);
    const end = pageLength * page;
    let results;
    if (search) {
        // Filter for search term
        search = search.toLowerCase();
        results = data.filter(val => String(val).toLowerCase().includes(search)).slice(start, end);
    } else {
        // Return unique values in given column
        results = data.slice(start, end);
    }

    return results;
}

// Get filtered datasets
const getFilteredDatasets = async(knex, query, email, page) => {
    const model = new datasets(knex);

    const results = await model.getFilteredDatasets(query, email, true, page);
    // Get tags and likes for search results
    for (let i = 0; i < results.length; i++) {
        results[i].tags = await getTags(knex, results[i].table_name);
        if (email) {
            results[i].liked = await model.getLike(email, results[i].table_name);
        } else {
            results[i].liked = false;
        }
        results[i].likes = await model.getLikeCount(results[i].table_name);
    }

    return results;
}

// Get count of dataset filter
const getFilteredDatasetsCount = async(knex, query, email) => {
    const model = new datasets(knex);

    const result = await model.getFilteredDatasetsCount(query, email);
    return result;
}

// Get the 2 letter language code for a given language
const getLanguage = (language) => {
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
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }
    
    const cols = await model.getColumnNames(metadata.table_name);
    const columns = cols.map(x => x.col);
    const dataScan = await dataQueries.subsetSearch(metadata.table_name, query, false, page, pageLength);
    const countScan = await dataQueries.subsetSearch(metadata.table_name, query, true);
    const count = countScan
        .collectSync()
        .getColumn("count")
        .toArray()[0];
    const data = dataScan
        .collectSync()
        .toRecords();

    return {
        columns,
        data,
        count
    }
}

// Download a subset of a dataset
const downloadSubset = async(knex, table, query, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    return await dataQueries.downloadSubset(table, query);
}

// Get dataset records by ids
const getRecordsByIds = async(knex, table, ids, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    const scan = await dataQueries.getRecordsByIds(metadata.table_name, ids);
    const data = scan
        .collectSync()
        .toRecords();

    return data;
}

// Get dataset records by ids
const downloadIds = async(knex, table, ids, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    return await dataQueries.downloadRecordsByIds(table, ids);
}

// Get text suggestions from a given user
const getSuggestionsFrom = async(knex, user, params) => {
    const model = new datasets(knex);

    const records = await model.getSuggestionsFrom(user, params.page, params.pageLength, params.sort_col, params.ascending);

    // Return early if total is 0
    if (records.total === 0) {
        return records;
    }

    // Get user names and old text
    const names = {};
    for (let i = 0; i < records.data.length; i++) {
        // Update date formatting
        records.data[i].post_date = records.data[i].post_date.toLocaleDateString();

        // User name
        const email = records.data[i].owner_email;
        let name = names[email]; 
        if (!name) {
            name = await getName(knex, email);
            names[email] = name;
        }
        records.data[i].name = name;
    }

    return records;
}

// Get text suggestions for a given user
const getSuggestionsFor = async(knex, user, params) => {
    const model = new datasets(knex);

    const records = await model.getSuggestionsFor(user, params.page, params.pageLength, params.sort_col, params.ascending);

    // Return early if total is 0
    if (records.total === 0) {
        return records;
    }

    // Get user names and old text
    const names = {};
    for (let i = 0; i < records.data.length; i++) {
        // Update date formatting
        records.data[i].post_date = records.data[i].post_date.toLocaleDateString();
        
        // User name
        const email = records.data[i].email;
        let name = names[email]; 
        if (!name) {
            name = await getName(knex, email);
            names[email] = name;
        }
        records.data[i].name = name;
    }

    return records;
}

// Get a suggestion by its id
const getSuggestion = async(knex, user, id) => {
    const model = new datasets(knex);

    const record = await model.getSuggestion(id);
    
    // Get the current metadata for this table
    const metadata = await model.getMetadata(record.table_name);

    // If the user of this table does not match the user, throw error
    if (metadata.email !== user && record.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Update date formatting
    record.post_date = record.post_date.toLocaleDateString();
        
    // User name
    const email = record.email;
    record.name = await getName(knex, email);

    return record;
}

// Delete a dataset and its metadata
const deleteDataset = async(knex, user, table) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (metadata.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Delete datasets from s3
    await runPython("delete_dataset", [table]);

    // Delete metadata
    // This will delete tags and columns via cascade
    await model.deleteMetadata(table);

    // Delete local files for dataset
    util.deleteDatasetFiles(table);
}

// Delete the given tag for the given dataset
const deleteTag = async(knex, user, table, tag) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    await model.deleteTag(table, tag);
}

// Unlike a dataset
const deleteLike = async(knex, user, table) => {
    const model = new datasets(knex);

    await model.deleteLike(user, table);
}

// Delete a suggestion by id
const deleteSuggestionById = async(knex, user, id) => {
    const model = new datasets(knex);

    // Get suggestion record to check email
    const record = await model.getSuggestion(id);

    // Get the current metadata for this table
    const curr = await model.getMetadata(record.table_name);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user && record.email !== user) {
        throw new Error(`User ${ user } is not permitted to delete this suggestion`);
    }

    await model.deleteSuggestionById(id);

    // Send reject/cancel email depending on who submitted delete request
    // Don't send email if the same user
    if (curr.email !== record.email) {
        // Send appropriate email
        await emails.suggestionEmail(
            knex, curr.email, record.email, curr.title,
            record.old_text, record.new_text, record.id,
            curr.email === user ? "reject" : "cancel"
        );
    }
}

module.exports = {
    createDataset,
    createDatasetAPI,
    uploadDataset,
    addTag,
    addTextCols,
    addSuggestion,
    updateMetadata,
    incClicks,
    updateText,
    addLike,
    getMetadata,
    getFullMetadata,
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
    downloadIds,
    getSuggestionsFor,
    getSuggestionsFrom,
    getSuggestion,
    deleteDataset,
    deleteTag,
    deleteLike,
    deleteSuggestionById
};