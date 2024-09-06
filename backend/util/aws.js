const pl = require("nodejs-polars");
// const { getCredentials } = require("../controllers/databases");
const { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand } = require("@aws-sdk/client-athena");
const { BatchClient, SubmitJobCommand } = require("@aws-sdk/client-batch");
const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require('crypto');
const humanize = require('humanize-duration');
const util = require("./file_management");
const setTimeoutAsync = require("timers/promises").setTimeout;

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

const renameFile = async(oldFile, newFile) => {
    const copyCommand = new CopyObjectCommand({
        CopySource: `${ process.env.S3_BUCKET }/${ oldFile }`,
        Bucket: process.env.S3_BUCKET,
        Key: newFile
    });
    await s3Client.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: oldFile
    });
    await s3Client.send(deleteCommand);
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

const submitBatchJob = async(table_name, num_threads = 4) => {
    const command = new SubmitJobCommand({
        jobName: table_name,
        jobQueue: process.env.BATCH_QUEUE,
        jobDefinition: process.env.BATCH_DEF,
        parameters: {
           table_name,
           num_threads
        }
    });

    const response = await batchClient.send(command);
    console.log("Batch job submitted:");
    console.log(response);
}

module.exports = {
    download,
    downloadFile,
    submitBatchJob
}