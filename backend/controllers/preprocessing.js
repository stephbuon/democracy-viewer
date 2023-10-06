const python = require("python-shell").PythonShell;
const util = require("../util/file_management");

const beginPreprocessing = async(datasets, table) => {
    // Run python program that conducts preprocessing
    let pythonOutput;
    await python.run("preprocessing/launch.py", {
        args: [ table ]
    }).then(x => {
        // Save python output
        pythonOutput = x;
        console.log(x);
    }).catch(x => {
        // Print python output
        console.log(x);
        throw new Error(x);
    });

    // Set dataset as processed when done
    const record = await datasets.getMetadata(table);
    if (!record.processed) {
        // Throw error if the record has not been processed
        throw new Error(pythonOutput);
    } else {
        // Return record if it has been processed
        return record;
    }
}

// Add split text records
const addSplitRecords = async(models, table_name, data, username) => {
    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await models.datasets.getMetadata(table_name);
    if (!metadata.is_public && (username !== "server" && metadata.username !== username)) {
        throw new Error(`User ${ user } does not have access to the dataset ${ dataset }`);
    }

    // Prep data to be inserted
    data = data.map(x => ({
        record_id: x.id,
        word: x.word === null ? "null" : x.word === undefined ? "undefined" : x.word,
        count: x.n,
        col: x.col,
        table_name
    }));

    // Loop through the data and insert rows
    const per_insert = Math.floor(2100 / Object.keys(data[0]).length) - Object.keys(data[0]).length;
    for (let i = 0; i < data.length; i += per_insert) {
        await models.preprocessing.addSplitWords(data.slice(i, i + per_insert));
    }

    return { records: data.length };
}

// Add split text records via file upload
const uploadSplitRecords = async(models, table_name, path, username) => {
    // Parse the provided csv file
    return await util.readCSV(path).then(async(data) => {
        return await addSplitRecords(models, table_name, data, username);
    });
}

// Add word embedding records
const addEmbeddingRecords = async(models, table_name, data) => {
    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await models.datasets.getMetadata(table_name);
    if (!metadata.is_public && (username !== "server" && metadata.username !== username)) {
        throw new Error(`User ${ user } does not have access to the dataset ${ dataset }`);
    }

    // Prep data to be inserted
    data = data.map(x => ({
        word: x.word === null ? "null" : x.word === undefined ? "undefined" : x.word,
        X1: x.X1,
        X2: x.X2,
        X3: x.X3,
        X4: x.X4,
        table_name
    }));

    // Loop through the data and insert rows
    const per_insert = Math.floor(2100 / Object.keys(data[0]).length) - Object.keys(data[0]).length;
    for (let i = 0; i < data.length; i += per_insert) {
        await models.preprocessing.addEmbeddings(data.slice(i, i + per_insert));
    }

    return { records: data.length };
}

// Add split text records via file upload
const uploadEmbeddingRecords = async(models, table_name, path, username) => {
    // Parse the provided csv file
    return await util.readCSV(path).then(async(data) => {
        return await addEmbeddingRecords(models, table_name, data, username);
    });
}

module.exports = {
    beginPreprocessing,
    addSplitRecords,
    uploadSplitRecords,
    addEmbeddingRecords,
    uploadEmbeddingRecords
};