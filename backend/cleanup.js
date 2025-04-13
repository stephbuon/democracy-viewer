const findRemoveSync = require('find-remove');

const deleteFiles = () => {
    const result = findRemoveSync("./files", {
        age: { seconds: 86400 },
        extensions: [".csv", ".json", ".xls", ".xlsx", ".pkl", ".parquet", ".txt"]
    });

    const cnt = Object.keys(result).length;
    console.log(`${ new Date() }: deleted ${ cnt } file(s)`);

    if (cnt > 0) {
        console.log("Files deleted:");
        Object.keys(result).forEach(x => console.log(`\t- ${ x }`));
    }
}

module.exports = deleteFiles;