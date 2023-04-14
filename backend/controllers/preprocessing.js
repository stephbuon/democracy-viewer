const files = require("../util/file_management");
const python = require("python-shell").PythonShell;

const beginPreprocessing = async(datasets, table) => {
    // Run python program that conducts preprocessing
    try {
        await python.run("preprocessing/launch.py", {
            args: [ table, path ]
        }).then(x => {
            // Print python output
            // console.log(x);
        });
    } catch(err) {
        throw new Error(err);
    }

    // Set dataset as processed when done
    const record = await datasets.updateMetadata(table, { processed: true });
    return record;
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