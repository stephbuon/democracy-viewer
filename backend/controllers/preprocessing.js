const files = require("../util/file_management");
const python = require("python-shell").PythonShell;

const beginPreprocessing = async(models, table) => {
    // Get all records from this dataset
    const path = `uploads/${ table }.csv`;
    // return await files.readCSV(path).then(async(data) => {
        
    // });

    // Run python program that conducts preprocessing
    try {
        await python.run("preprocessing/launch.py", {
            args: [ table, path ]
        }).then(x => console.log(x));
    } catch(err) {
        throw new Error(err);
    }

    return null;
}

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

module.exports = {
    beginPreprocessing,
    addSplitRecords
};