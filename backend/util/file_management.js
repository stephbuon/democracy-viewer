const fs = require("fs");
const multer = require("multer");
const util = require("util");
const maxUploadSize = 100 * 1024 * 1024;

// Clear the given directory of unwanted files
const clearDirectory = (path) => {
    // Get all files in the downloads folder
    const files = fs.readdirSync(path);

    // Iterate through files and delete anything not named "README.md"
    files.forEach(file => {
        if (file !== "README.md") {
            fs.unlinkSync(path + file);
        }
    });
}

// Generate a csv file from an array of records
const generateCSV = (name, records) => {
    // Generate file name using given name and time stamp
    const fileName = `${ name }_${ Date.now() }.csv`;

    // String for file data
    let data = "";
    // Generate col names from keys of first record
    const colNames = Object.keys(records[0]);
    // Add all column names and a line break
    data += colNames.join(",") + "\n";

    // Iterate through records and add all data to file data
    records.forEach(row => {
        data += Object.values(row).join(",") + "\n";
    });

    // Create file
    fs.writeFileSync(fileName, data);

    return fileName;
}

// Read a csv file
const readCSV = (path) => {
    // If the file path does not end in '.csv', delete file and throw error
    if (path.substring(path.length - 4, path.length) !== ".csv") {
        fs.unlinkSync(path);
        throw new Error(`${ path.substring(path.length - 4, path.length) } is an invalid file type`);
    }

    // Read file an split into rows
    const fileContents = fs.readFileSync(path, { encoding: 'utf-8' });
    let rows = fileContents.split("\n");
    // Split rows by commas
    rows = rows.map(x => x.split(","));

    // Get column names from first row
    const names = [];
    for (let i = 0; i < rows[0].length; i++) {
        names.push(rows[0][i].replace("\r", ""));
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
            curr[names[j]] = rows[i][j].replace("\r", "");
        }
        // If curr is not empty, add to data
        if (Object.keys(curr).length > 0) {
            data.push(curr);
        }
    }

    // Delete file once read
    fs.unlinkSync(path);

    return data;
}

// Upload a file to the server
// Based on https://www.bezkoder.com/node-js-express-file-upload/
const uploadFile = util.promisify(
    multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, "./uploads");
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        // limits: { fileSize: maxUploadSize }
    }).single("file")
);

module.exports = {
    clearDirectory,
    generateCSV,
    readCSV,
    uploadFile
}