const fs = require("fs");
const multer = require("multer");
const util = require("util");
const csv = require("csv-parser");
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
const readCSV = (path) => new Promise((resolve, reject) => {
    // If the file path does not end in '.csv', delete file and throw error
    if (path.substring(path.length - 4, path.length) !== ".csv") {
        fs.unlinkSync(path);
        throw new Error(`${ path.substring(path.length - 4, path.length) } is an invalid file type`);
    }

    // Parse csv
    const data = [];
    fs.createReadStream(path)
        .pipe(csv())
        .on("data", d => data.push(d))
        .on("end", () => {
            fs.unlinkSync(path);
            resolve(data);
        })
        .on("error", err => {
            fs.unlinkSync(path);
            reject(err);
        });
});

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