const fs = require("fs");
const multer = require("multer");
const util = require("util");
const csv_read = require("csv-parser");
const csv_write =require("objects-to-csv");

const maxUploadSize = 100 * 1024 * 1024;

// Read a file into memory as a readable stream
const readFile = (path) => {
    return fs.createReadStream(path);
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

// Check if a given file exists
const fileExists = (name) => {
    return fs.existsSync(name);
}

// Generate a csv file from an array of records
const generateCSV = async(name, records) => {
    // Split records into sets of 10,000
    for (let i = 0; i <= records.length; i += 10000) {
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

// Generate a file of any format
const generateFile = (name, data) => {
    fs.writeFileSync(name, data);
}

// Read a csv file
const readCSV = (path, del = true) => new Promise((resolve, reject) => {
    if (path.substring(path.length - 4, path.length) !== ".csv") {
        // If the file path does not end in '.csv', delete file and throw error
        fs.unlinkSync(path);
        throw new Error(`${ path.substring(path.length - 4, path.length) } is an invalid file type`);
    } else if (!fileExists(path)) {
        // If the file does not exist, throw error
        throw new Error(`${ path } does not exist`);
    }

    // Parse csv
    const data = [];
    fs.createReadStream(path)
        .pipe(csv_read())
        .on("data", d => data.push(d))
        .on("end", () => {
            if (del) {
                fs.unlinkSync(path);
            }

            resolve(data);
        })
        .on("error", err => {
            if (del) {
                fs.unlinkSync(path);
            }

            reject(err);
        });
});

// Read a JSON file
const readJSON = (path) => {
    const str = fs.readFileSync(path);
    fs.unlinkSync(path);
    return JSON.parse(str);
}

// Upload a file to the server
// Based on https://www.bezkoder.com/node-js-express-file-upload/
const uploadFile = util.promisify(
    multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, "./files/uploads");
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        // limits: { fileSize: maxUploadSize }
    }).single("file")
);

// Rename a file
const renameFile = (oldName, newName) => {
    fs.renameSync(oldName, newName);
}

module.exports = {
    readFile,
    deleteFiles,
    fileExists,
    generateCSV,
    generateJSON,
    generateFile,
    readCSV,
    readJSON,
    uploadFile,
    renameFile
}