

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
    addSplitRecords
};