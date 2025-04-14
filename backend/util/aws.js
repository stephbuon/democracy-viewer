const pl = require("nodejs-polars");
// const { getCredentials } = require("../controllers/databases");
const { Upload } = require("@aws-sdk/lib-storage");
const { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand } = require("@aws-sdk/client-athena");
const { BatchClient, SubmitJobCommand } = require("@aws-sdk/client-batch");
const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto');
const humanize = require('humanize-duration');
const util = require("./file_management");
const setTimeoutAsync = require("timers/promises").setTimeout;
const fs = require("fs");

const BASE_PATH = "files/s3";

const athenaClient = new AthenaClient({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET
    }
});
const batchClient = new BatchClient({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET
    }
})
const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET
    }
});

const hashQuery = (query) => {
    return crypto.createHash('md5').update(query).digest('hex');
}

const submitAthenaQuery = async(query) => {
    console.log(query);
    const command = new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: {
            Database: process.env.ATHENA_DB
        },
        ResultConfiguration: {
            OutputLocation: process.env.ATHENA_OUTPUT
        }
    });
    const response = await athenaClient.send(command);

    return response.QueryExecutionId;
}

const waitAthenaQuery = async(queryId) => {
    const command = new GetQueryExecutionCommand({
        QueryExecutionId: queryId
    });

    while (true) {
        const response = await athenaClient.send(command);
        const status = response.QueryExecution.Status.State.toString();

        if (["SUCCEEDED", "FAILED", "CANCELLED"].includes(status)) {
            console.log(response.QueryExecution.Status)
            return status;
        } else {
            await setTimeoutAsync(100)
        }
    }
}

const deleteFile = async(file) => {
    const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: file
    });
    await s3Client.send(deleteCommand);
}

const renameFile = async(oldFile, newFile) => {
    const copyCommand = new CopyObjectCommand({
        CopySource: `${ process.env.S3_BUCKET }/${ oldFile }`,
        Bucket: process.env.S3_BUCKET,
        Key: newFile
    });
    await s3Client.send(copyCommand);

   await deleteFile(oldFile);
}

const checkFileExists = async(filePath) => {
    const command = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: filePath
    });

    try {
        await s3Client.send(command);
        
        return true;
    } catch (err) {
        if (err.$metadata && err.$metadata.httpStatusCode === 404) {
            return false;
        } else {
            throw new Error(err);
        }
    }
}

const download = async(query) => {
    const queryFilename = hashQuery(query);
    const localPath = `${ BASE_PATH }/athena/${ queryFilename }.csv`;

    if (!util.fileExists(localPath)) {
        if (!(await checkFileExists(localPath))) {
            const startTime = Date.now();
            const queryId = await submitAthenaQuery(query);
            const status = await waitAthenaQuery(queryId);
            console.log(`Athena query time: ${humanize(Date.now() - startTime)}`);

            if (status.toLowerCase() !== "succeeded") {
                throw new Error(`Query failed with status ${ status }`);
            }

            await renameFile(`athena/${ queryId }.csv`, `athena/${ queryFilename }.csv`);
        }

        await downloadFile(localPath, "athena", `${ queryFilename }.csv`);
    }

    const df = pl.scanCSV(localPath, { quoteChar: '"'});
    return df;
}

const downloadFile = async(localFile, folder, name) => {
    if (util.fileExists(localFile)) {
        console.log(`${localFile} already exists`);
    } else {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `${folder}/${name}`
        })
    
        const startTime = Date.now();

        const response = await s3Client.send(command);
        const data = await response.Body.transformToString();
        util.generateFile(localFile, data);
    
        console.log(`Download time: ${ humanize(Date.now() - startTime) }`);
    }
}

const submitBatchJob = async(table_name, batch_num = null) => {
    let params = {
        table_name
    };
    let name = `start-${ table_name }`
    if (batch_num) {
        params = {
            ...params,
            batch_num
        }
        name += `-${ batch_num }`;
    }

    // Submit job
    const command = new SubmitJobCommand({
        jobName: name,
        jobQueue: process.env.BATCH_QUEUE_LARGE,
        jobDefinition: process.env.BATCH_START_PROCESSING_DEF,
        parameters: params
    });
    const response = await batchClient.send(command);
    console.log("Batch job submitted:");
    console.log(response);
}

const downloadFileDirect = async(query) => {
    const queryFilename = hashQuery(query);
    const localPath = `${ BASE_PATH }/athena/${ queryFilename }.csv`;

    if (!(await checkFileExists(localPath))) {
        const startTime = Date.now();
        const queryId = await submitAthenaQuery(query);
        const status = await waitAthenaQuery(queryId);
        console.log(`Athena query time: ${humanize(Date.now() - startTime)}`);

        if (status.toLowerCase() !== "succeeded") {
            throw new Error(`Query failed with status ${ status }`);
        }

        await renameFile(`athena/${ queryId }.csv`, `athena/${ queryFilename }.csv`);
    }

    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `athena/${ queryFilename }.csv`
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

const downloadGraph = async(name) => {
    // Specify file to download
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `graphs/${ name }/graph.png`
    });

    // Return signed url
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

const uploadGraph = async(name) => {
    // Generate file path for this graph and its settings
    const graphPath = `graphs/${ name }/graph.png`;

    // Check if this graph has already been uploaded
    const graphExists = await checkFileExists(graphPath);

    if (graphExists ) {
        // Return placeholder if this graph has already been uploaded
        return "Already uploaded";
    }

    // Specify file upload command for an image
    const uploadCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: graphPath,
        ContentType: "image/png"
    });

    // Get upload API URL
    return await getSignedUrl(s3Client, uploadCommand, { expiresIn: 3600 });
}

const uploadFileDirect = async(table_name, batch_num = null) => {
    let name;
    if (batch_num) {
        name = `temp_uploads/${ table_name }-${ batch_num }.csv`;
    } else {
        name = `temp_uploads/${ table_name }.csv`;
    }

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: name,
        ContentType: "text/csv"
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

const uploadFile = async(localFile, s3File) => {
    await new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.S3_BUCKET,
            Key: s3File,
            Body: fs.createReadStream(localFile)
        }
    })
        .done();
}

const deleteTempUpload = async(table, batch_num = null) => {
    let path;
    if (batch_num) {
        path = `temp_uploads/${ table }-${ batch_num }.csv`;
    } else {
        path = `temp_uploads/${ table }.csv`;
    }

    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: path
    });

    await s3Client.send(command);
}

module.exports = {
    checkFileExists,
    download,
    downloadFile,
    submitBatchJob,
    downloadFileDirect,
    uploadGraph,
    uploadFile,
    deleteFile,
    downloadGraph,
    uploadFileDirect,
    uploadFile,
    deleteTempUpload
}