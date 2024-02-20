const util = require("../util/file_management");
const axios = require("axios").default;
const python = require("python-shell").PythonShell;
const { encodeConnection } = require("./databases");

const datasets = require("../models/datasets"); 

// Upload a new dataset from a csv file
const createDataset = async(knex, path, username) => {
    const model = new datasets(knex);

    // Get the file name from the file path
    let name = path.split("/");
    name = name[name.length - 1].split(".");
    name = name[0] + "_" + Date.now();

    // Create empty metadata for data set
    await model.createMetadata(name, username);

    return name;
}

// Import a new dataset from an api
const createDatasetAPI = async(knex, endpoint, username, token = null) => {
    const model = new datasets(knex);

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
    const filename = `uploads/${ username }.csv`;
    
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

    // Create empty metadata for data set
    await model.createMetadata(name, username);

    return output;
}

// Upload dataset records using JavaScript
const uploadDatasetJS = async(knex, name, user) => {
    const model = new datasets(knex);

    // Get the current metadata for this dataset
    const curr = await model.getMetadata(name);

    // If the user of this dataset does not match the user making the updates, throw error
    if (curr.username !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Get file name from table name
    const fileName = name.split("_").slice(0, -1).join("_");
    const path = `uploads/${fileName}.csv`;

    // Parse the provided csv file
    return await util.readCSV(path).then(async(data) => {
        // Update metadata with number of records
        await model.updateMetadata(name, { record_count: data.length });

        // If there is a column called id, change it to id_
        if (data[0].id) {
            data = data.map(x => {
                x.id_ = { ...x.id };
                delete x.id;
                return x;
            })
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

        // Filter out columns with a length of 0
        Object.keys(maxLengths).forEach(x => {
            if (maxLengths[x] === 0) {
                delete maxLengths[x];
            }
        });
    
        // Create a new table with the file name and column names
        await model.createDataset(name, Object.keys(data[0]), maxLengths);

        // Loop through the data and insert rows
        const per_insert = Math.floor(2100 / Object.keys(data[0]).length) - Object.keys(data[0]).length;
        for (let i = 0; i < data.length; i += per_insert) {
            await model.addRows(name, data.slice(i, i + per_insert));
        }
    
        // Return the first 10 rows of the new dataset and the table name
        const results = await model.getHead(name);
        const output = {
            table_name: name,
            data: results
        }
        return output;
    });
}

// Upload dataset records using Python
const uploadDatasetPy = async(knex, name, user) => {
    const model = new datasets(knex);

    // Extract username from user
    const username = user.username;

    // Get the current metadata for this dataset
    const curr = await model.getMetadata(name);

    // If the user of this dataset does not match the user making the updates, throw error
    if (curr.username !== username) {
        throw new Error(`User ${ username } is not the owner of this dataset`);
    }

    // Get file name from table name
    const fileName = name.split("_").slice(0, -1).join("_");
    const path = `uploads/${fileName}.csv`;

    // Add file names as command line arguments
    const options = {
        args: [ name, path ]
    }

    // If distributed connection, add encoded token to args
    if (user.database) {
        const defaultConfig = require("../knexfile").development;
        const token = await encodeConnection(require("knex")(defaultConfig), user.database);
        options.args.push(token);
    }

    // If a python path is provided in .env, use it
    // Else use the default path
    if (process.env.PYTHON_PATH) {
        options["pythonPath"] = process.env.PYTHON_PATH;
    }

    // Run python program to upload dataset
    await python.run("util/upload_dataset.py", options).then(x => console.log(x)).catch(x => {
        console.error(x);
        throw new Error(x);
    });
    
    // Delete file now that it has been uploaded
    util.deleteFiles(path)

    // DELETE THIS ONCE PREPROCESSING IS RUNNING ON A REMOTE SERVER
    // Begin preprocessing
    options["args"] = options["args"].filter(x => x != path)
    await python.run("preprocessing/launch.py", options).then(x => console.log(x)).catch(x => {
        console.error(x);
        throw new Error(x);
    });

    // Return the first 10 rows of the new dataset and the table name
    const results = await model.getHead(name);
    const output = {
        table_name: name,
        data: results
    }
    return output;
}

// Add a tag for a dataset
const addTag = async(knex, user, table, tags) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== "aws_server" && curr.username !== user) {
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
    if (curr.username !== "aws_server" && curr.username !== user) {
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

// Change the data type of a column in a dataset
const changeColType = async(knex, table, body) => {
    const model = new datasets(knex);

    if (Array.isArray(body)) {
        // If body is an array, change all types in array
        for (let i = 0; i < body.length; i++) {
            await model.changeColType(table, body[i].column, body[i].type);
        }
    } else {
        // Else, change one column type
        await model.changeColType(table, body.column, body.type);
    }
    // Get the first 10 rows of the dataset
    const results = model.getHead(table);
    return results;
}

// Update a dataset's metadata
const updateMetadata = async(knex, user, table, params) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (user !== "aws_server" && curr.username !== user) {
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

// Get datasets by user
const getUserDatasets = async(knex, username) => {
    const model = new datasets(knex);

    const result = await model.getUserDatasets(username);
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
    const results = Object.keys(names).filter(x => {console.log(textCols); return textCols.indexOf(x) === -1});
    return results;
}

// Get unique values in a dataset column
const getColumnValues = async(knex, table , column) => {
    const model = new datasets(knex);

    const records = await model.getColumnValues(table, column);
    const results = records.map(x => x[column]);
    return results;
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
const getSubset = async(knex, table, query, page) => {
    const model = new datasets(knex);

    // Get string columns
    const cols = await model.getColumnNames(table);
    const strCols = Object.keys(cols).filter(x => cols[x].type === "nvarchar");
    // Get subset records
    const records = await model.subsetTable(table, query, true, page);
    // Wrap string cols in quotes
    return records.map(x => {
        strCols.forEach(col => {
            x[col] = '"' + x[col] + '"';
        });

        return x;
    });
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
    util.clearDirectory("./downloads/");
    // Get all records in this dataset
    const count = await model.subsetTableCount(table, params);
    const pages = Math.ceil(count / 50000);
    params.pageLength = 50000;
    // Add dataset download record and get id
    const downloadId = await model.addDownload(username, table, pages);
    // Get string columns
    const cols = await model.getColumnNames(table);
    const strCols = Object.keys(cols).filter(x => cols[x].type === "nvarchar");
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
    const fileName = util.generateCSV(`./downloads/${ table }.csv`, records);
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
    if (curr.username !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await model.deleteTable(table);
    await model.deleteMetadata(table);

    return null;
}

// Delete the given tag for the given dataset
const deleteTag = async(knex, user, table, tag) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== "aws_server" && curr.username !== user) {
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
    if (curr.username !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await model.deleteTextCol(table, col);

    return null;
}

module.exports = {
    createDataset,
    createDatasetAPI,
    uploadDatasetJS,
    uploadDatasetPy,
    addTag,
    addTextCols,
    changeColType,
    updateMetadata,
    incClicks,
    getMetadata,
    getUserDatasets,
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