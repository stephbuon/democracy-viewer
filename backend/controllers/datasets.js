const fs = require("fs");

// Upload a new dataset from a csv file
const createDataset = async(datasets, path) => {
    // Parse the provided csv file
    const data = readCSV(path);

    // Get the file name from the file path
    let name = path.split("/");
    name = name[name.length - 1].split(".");
    name = name[0];

    // Create a new table with the file name and column names
    await datasets.createDataset(name, Object.keys(data[0]));

    // Loop through the data and insert rows
    for (let i = 0; i < data.length; i++) {
        await datasets.addRow(name, data[i]);
    }

    // Return the first 10 rows of the new dataset
    const results = await datasets.getHead(name);
    return results;
}

// Read a csv file
const readCSV = (path) => {
    // Read file an split into rows
    const fileContents = fs.readFileSync(path, { encoding: 'utf-8' });
    let rows = fileContents.split("\n");
    // Split rows by commas
    rows = rows.map(x => x.split(","));

    // Get column names from first row
    const names = [];
    for (let i = 0; i < rows[0].length; i++) {
        names.push(rows[0][i]);
    }

    // Collect data from the rest of the rows
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        // Create object with current row data
        const curr = {};
        for (let j = 0; j < rows[i].length; j++) {
            // If rows[i][j] is an empty string, end loop
            if (!rows[i][j]) {
                break;
            } 
            curr[names[j]] = rows[i][j];
        }
        // If curr is not empty, add to data
        if (Object.keys(curr).length > 0) {
            data.push(curr);
        }
    }

    return data;
}

module.exports = {
    createDataset
};