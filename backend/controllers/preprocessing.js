const python = require("python-shell").PythonShell;

const beginPreprocessing = async(datasets, table) => {
    // Run python program that conducts preprocessing
    let pythonOutput;
    await python.run("preprocessing/launch.py", {
        args: [ table ]
    }).then(x => {
        // Save python output
        pythonOutput = x;
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
const addSplitRecords = async(preprocessing, table_name, data) => {
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
        await preprocessing.addSplitWords(data.slice(i, i + per_insert));
    }

    return { records: data.length };
}

// Add word embedding records
const addEmbeddingRecords = async(preprocessing, table_name, data) => {
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
        await preprocessing.addEmbeddings(data.slice(i, i + per_insert));
    }

    return { records: data.length };
}

module.exports = {
    beginPreprocessing,
    addSplitRecords,
    addEmbeddingRecords
};