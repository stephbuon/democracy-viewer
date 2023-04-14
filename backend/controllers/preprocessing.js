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
const addSplitRecords = async(preprocessing, table, data) => {
    for (let i = 0; i < data.length; i++) {
        const record = {
            record_id: data[i].id,
            word: data[i].word,
            count: data[i].n,
            col: data[i].col,
            table_name: table
        }
        await preprocessing.addSplitWord(record);
    }

    return { records: data.length };
}

// Add word embedding records
const addEmbeddingRecords = async(preprocessing, table_name, data) => {
    for (let i = 0; i < data.length; i++) {
        const record = {
            ...data,
            table_name
        }
        await preprocessing.addEmbedding(record);
    }

    return { records: data.length };
}

module.exports = {
    beginPreprocessing,
    addSplitRecords,
    addEmbeddingRecords
};