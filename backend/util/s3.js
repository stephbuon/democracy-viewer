const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, S3 } = require("@aws-sdk/client-s3");
const util = require("../util/file_management");
require('dotenv').config();

const uploadToS3 = async(localPath, s3Path, name) => {
    const file = util.readFile(`${ localPath }/${ name }`);

    const resp = new Upload({
        client: new S3Client({
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_KEY,
                secretAccessKey: process.env.S3_SECRET
            }
        }),
        params: {
            Bucket: process.env.S3_BUCKET,
            Key: `${ process.env.DB_VERSION }/${ s3Path }/${ name }`,
            Body: file
        }
    }).on("httpUploadProgress", progress => console.log(progress));

    await resp.done();
}

module.exports = {
    uploadToS3
}