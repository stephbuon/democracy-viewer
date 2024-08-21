const pl = require("nodejs-polars");
const { getCredentials } = require("../controllers/databases");

const scanDataset = async(folder, dataset) => {
    let storageOptions = {};
    let dir;
    let bucket;

    if (dataset.distributed) {
        const creds = await getCredentials(require("knex")(defaultConfig()), dataset.distributed);
        storageOptions.accessKeyId = creds.key_;
        storageOptions.secretAccessKey = creds.secret;
        storageOptions.region = creds.region;
        dir = creds.dir;
        bucket = creds.bucket;
    } else {
        storageOptions.accessKeyId = process.env.S3_KEY;
        storageOptions.secretAccessKey = process.env.S3_SECRET;
        storageOptions.region = process.env.S3_REGION;
        dir = process.env.DB_VERSION;
        bucket = process.env.S3_BUCKET;
    }
    let path;
    if (dir) {
        path = `${ dir }/${ folder }/${ dataset.table_name }.parquet`;
    } else {
        path = `${ folder }/${ dataset.table_name }.parquet`;
    }

    const s3Path = `s3://${ bucket }/${ path }`;

    let df = pl.scanParquet(s3Path, { storageOptions });

    if (folder === 'tokens') {
        df = df.withColumns(
            pl.col('record_id').cast(pl.UInt32, false)
        );
    }
      
    return df;
}

module.exports = {
    scanDataset
}