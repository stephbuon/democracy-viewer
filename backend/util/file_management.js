const fs = require("fs");
const multer = require("multer");
const util = require("util");
const csv_read = require("csv-parser");
const csv_write =require("objects-to-csv");

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

// Delete an individual file or multiple files
const deleteFiles = (files) => {
    if (Array.isArray(files)) {
        // Delete multiple files
        files.forEach(f => fs.unlinkSync(f));
    } else {
        // Delete one file
        fs.unlinkSync(files);
    }
}

// Generate a csv file from an array of records
const generateCSV = async(name, records) => {
    // Split records into sets of 10,000
    for (let i = 0; i < records.length; i += 10000) {
        // If i is 0, overwrite file
        // Else, append to file
        const csv = new csv_write(records.slice(i, i + 10000));
        await csv.toDisk(name, { append: i === 0 ? false : true });
    }
    
    return name;
}

// Generate a JSON file from an object or array of objects
const generateJSON = (name, data) => {
    fs.writeFileSync(name, JSON.stringify(data, null, 4));
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
        .pipe(csv_read())
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

// Read a JSON file
const readJSON = (path) => {
    const str = fs.readFileSync(path);
    return JSON.parse(str);
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
    deleteFiles,
    generateCSV,
    generateJSON,
    readCSV,
    readJSON,
    uploadFile
}