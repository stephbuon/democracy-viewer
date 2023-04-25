const util = require("../util/file_management");

// Upload a new dataset from a csv file
const createDataset = async(datasets, path, username) => {
    // Parse the provided csv file
    return await util.readCSV(path).then(async(data) => {
        // Get the file name from the file path
        let name = path.split("/");
        name = name[name.length - 1].split(".");
        name = name[0] + "_" + Date.now();

        // If there is a column called id, change it to id_
        if (data[0].id) {
            data = data.map(x => {
                x.id_ = { ...x.id };
                delete x.id;
                return x;
            })
        }

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

        // Create empty metadata for data set
        await datasets.createMetadata(name, username);

        // Loop through the data and insert rows
        const per_insert = Math.floor(2100 / Object.keys(data[0]).length) - Object.keys(data[0]).length;
        for (let i = 0; i < data.length; i += per_insert) {
            await datasets.addRows(name, data.slice(i, i + per_insert));
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

// Add a tag for a dataset
const addTag = async(datasets, user, table, tags) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    // If cols is not an array, make it an array
    if (!Array.isArray(tags)) {
        tags = [ tags ];
    }

    // Add tags to db
    await datasets.addTag(table, tags);

    // Return all tags for this dataset
    const records = await getTags(datasets, table);
    return records;
}

// Add text column(s) for a dataset
const addTextCols = async(datasets, user, table, cols) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    // If cols is not an array, make it an array
    if (!Array.isArray(cols)) {
        cols = [ cols ];
    }

    // Add data to db
    await datasets.addTextCols(table, cols);

    // Return all text columns for this dataset
    const records = await getTextCols(datasets, table);
    return records;
}

// Change the data type of a column in a dataset
const changeColType = async(datasets, table, body) => {
    if (Array.isArray(body)) {
        // If body is an array, change all types in array
        for (let i = 0; i < body.length; i++) {
            await datasets.changeColType(table, body[i].column, body[i].type);
        }
    } else {
        // Else, change one column type
        await datasets.changeColType(table, body.column, body.type);
    }
    // Get the first 10 rows of the dataset
    const results = datasets.getHead(table);
    return results;
}

// Update a dataset's metadata
const updateMetadata = async(datasets, user, table, params) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (user !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
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

// Get text columns by dataset
const getTextCols = async(datasets, table) => {
    // Get col names from table
    const records = await datasets.getTextCols(table);
    // Convert objects to strings with col names
    const results = records.map(x => x.col);
    return results;
}

// Download a subset of a dataset
const downloadSubset = async(datasets, table, params) => {
    // Clear the downloads folder on the server
    util.clearDirectory("./downloads/");
    // Get all records in this dataset
    const count = await datasets.subsetTableCount(table, params);
    const pages = Math.ceil(count / 50000);
    params.pageLength = 50000;
    let records = [];
    for (let i = 1; i <= pages; i++) {
        const curr = await datasets.subsetTable(table, params, true, i);
        records = [ ...records, ...curr ];
    }
    // Generate csv from records
    const fileName = util.generateCSV(`./downloads/${ table }.csv`, records);
    // Return generated file name
    return fileName;
}

// Delete a dataset and its metadata
const deleteDataset = async(datasets, user, table) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
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
    if (curr.username !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await datasets.deleteTag(table, tag);

    return null;
}

// Delete a text column fro a dataset
const deleteTextCol = async(datasets, user, table, col) => {
    // Get the current metadata for this table
    const curr = await datasets.getMetadata(table);

    // If the user of this table does not match the user making the updates, throw error
    if (curr.username !== "aws_server" && curr.username !== user) {
        throw new Error(`User ${ curr.username } is not the owner of this dataset`);
    }

    await datasets.deleteTextCol(table, col);

    return null;
}

module.exports = {
    createDataset,
    addTag,
    addTextCols,
    changeColType,
    updateMetadata,
    downloadSubset,
    getUniqueTags,
    getTags,
    getTextCols,
    deleteDataset,
    deleteTag,
    deleteTextCol
};