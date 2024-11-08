const fs = require("fs");
const multer = require("multer");
const util = require("util");
const csv_read = require("csv-parser");
const csv_write =require("objects-to-csv");
const runPython = require("./python_config");
const findRemoveSync = require('find-remove');

// Read a file into memory as a readable stream
const readFile = (path) => {
    return fs.readFileSync(path, "utf8");
}

// Delete all files for a given dataset
const deleteDatasetFiles = (name) => {
    const result = findRemoveSync("files", { prefix: name });

    const cnt = Object.keys(result).length;
    console.log(`${ new Date() }: deleted ${ cnt } file(s)`);

    if (cnt > 0) {
        console.log("Files deleted:");
        Object.keys(result).forEach(x => console.log(`\t- ${ x }`));
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

// Get the column names of a csv file
const getCsvHeaders = async(path) => new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path);
    const parser = csv_read();
    let headers = [];

    parser.on("headers", (h) => {
        headers = h.map(x => x.replace(/[^\x00-\x7F]/g, "").trim()) // Remove non-ASCII characters
            .filter(x => x !== ""); // Filter out whitespace-only column names
        // Close the stream after reading the headers
        stream.destroy();
        resolve(headers);
    });

    parser.on("error", (error) => {
        reject(error);
    });

    stream.on("error", (error) => {
        reject(error);
    });

    stream.pipe(parser);
});

// Read a JSON file
const readJSON = (path, del = true) => {
    const str = fs.readFileSync(path);
    if (del) {
        fs.unlinkSync(path);
    }
    return JSON.parse(str);
}

// Upload a file to the server
// Based on https://www.bezkoder.com/node-js-express-file-upload/
const maxUploadSize = 150 * 1024 * 1024;
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
        limits: { fileSize: maxUploadSize }
    }).single("file")
);

// Rename a file
const renameFile = (oldName, newName) => {
    fs.renameSync(oldName, newName);
}

// Download a data files from S3
const downloadDataset = async(name, distributed, dataset = false, tokens = false) => {
    const output = {};

    // Store dataset if already downloaded
    if (dataset) {
        const path = `files/nodejs/datasets/${ name }.json`;
        if (fileExists(path)) {
            output["dataset"] = readJSON(path, false);
            dataset = false;
        }
    } 

    // Store tokens if already downloaded
    if (tokens) {
        const path = `files/nodejs/tokens/${ name }.json`;
        if (fileExists(path)) {
            output["tokens"] = readJSON(path, false);
            tokens = false;
        }
    }

    // Determine parameter to send to python script
    let downloadType;
    if (dataset && tokens) {
        downloadType = "both";
    } else if (dataset) {
        downloadType = "dataset";
    } else if (tokens) {
        downloadType = "tokens";
    } else {
        // Return output if python script isn't needed
        return output;
    }

    // Download data from s3 with python
    await runPython("download_dataset", [name, downloadType], distributed);

    // Update output
    if (dataset) {
        output["dataset"] = readJSON(`files/nodejs/datasets/${ name }.json`, false);
    }
    if (tokens) {
        output["tokens"] = readJSON(`files/nodejs/tokens/${ name }.json`, false);
    }

    return output;
}

module.exports = {
    readFile,
    deleteDatasetFiles,
    fileExists,
    generateCSV,
    generateJSON,
    generateFile,
    readCSV,
    getCsvHeaders,
    readJSON,
    uploadFile,
    renameFile,
    downloadDataset
}