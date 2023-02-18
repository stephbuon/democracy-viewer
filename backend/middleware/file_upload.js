// Based on https://www.bezkoder.com/node-js-express-file-upload/
const multer = require("multer");
const util = require("util");
const maxSize = 100 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, file.originalname);
    }
});

const uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize }
}).single("file");

const uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;