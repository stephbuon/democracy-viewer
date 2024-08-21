import boto3
from boto3.s3.transfer import TransferConfig
import datetime as dt
import humanize
import jwt
import os
import polars as pl
from time import time

BASE_PATH = "files/s3/{}".format(os.environ.get("DB_VERSION"))

# Use TransferConfig to optimize the download
config = TransferConfig(
    multipart_threshold=1024 * 500,  # 100MB
    max_concurrency=10,
    multipart_chunksize=1024 * 500,  # 100MB
    use_threads=True
)

def get_creds(token: str | None = None) -> dict[str, str]:
    if token == None:
        return {
            "region": os.environ.get("S3_REGION"),
            "bucket": os.environ.get("S3_BUCKET"),
            "dir": os.environ.get("DB_VERSION"),
            "key_": os.environ.get("S3_KEY"),
            "secret": os.environ.get("S3_SECRET")
        }
        
    secret = os.environ.get("TOKEN_SECRET")
    return jwt.decode(token, secret, "HS256")

def upload(df: pl.DataFrame, folder: str, name: str, token: str | None = None) -> None:
    distributed = get_creds(token)
    
    # Convert file to parquet
    start_time = time()
    local_file = "{}/{}/{}.parquet".format(BASE_PATH, folder, name)
    df.write_parquet(local_file, use_pyarrow=True)
    print("Conversion time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
    
    # Upload file to s3
    if "key_" in distributed.keys() and "secret" in distributed.keys():
        s3_client = boto3.client(
            "s3",
            aws_access_key_id = distributed["key_"],
            aws_secret_access_key = distributed["secret"],
            region_name = distributed["region"]
        )
    else:
        s3_client = boto3.client(
            "s3",
            region_name = distributed["region"]
        )
        
    if "dir" in distributed.keys():
        path = "{}/{}/{}.parquet".format(distributed["dir"], folder, name)
    else:
        path = "{}/{}.parquet".format(folder, name)
        
    start_time = time()
    s3_client.upload_file(
        local_file,
        distributed["bucket"],
        path,
        Config = config
    )
    print("Upload time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
    
def upload_file(folder: str, name: str, token: str | None = None) -> None:
    distributed = get_creds(token)

    # Upload file to s3
    if "key_" in distributed.keys() and "secret" in distributed.keys():
        s3_client = boto3.client(
            "s3",
            aws_access_key_id = distributed["key_"],
            aws_secret_access_key = distributed["secret"],
            region_name = distributed["region"]
        )
    else:
        s3_client = boto3.client(
            "s3",
            region_name = distributed["region"]
        )
        
    local_file = "{}/{}/{}".format(BASE_PATH, folder, name)
    if "dir" in distributed.keys():
        path = "{}/{}/{}".format(distributed["dir"], folder, name)
    else:
        path = "{}/{}".format(folder, name)
      
    start_time = time()  
    s3_client.upload_file(
        local_file,
        distributed["bucket"],
        path,
        Config = config
    )
    print("Upload time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
    
def download(folder: str, name: str, token: str | None = None) -> pl.LazyFrame:
    distributed = get_creds(token)
    
    if "dir" in distributed.keys():
        path = "{}/{}/{}.parquet".format(distributed["dir"], folder, name)
    else:
        path = "{}/{}.parquet".format(folder, name)
        
    storage_options = {
        "aws_access_key_id": distributed["key_"],
        "aws_secret_access_key": distributed["secret"],
        "aws_region": distributed["region"],
    }
    s3_path = "s3://{}/{}".format(distributed["bucket"], path)
    df = pl.scan_parquet(s3_path, storage_options=storage_options)
    if folder == "tokens":
        df = df.with_columns(
            record_id = pl.col("record_id").cast(pl.UInt32, strict = False)
        )
    
    return df

def download_data(folder: str, name: str, ext: str, token: str | None = None) -> str:
    distributed = get_creds(token)
    
    # Download file from s3
    if "key_" in distributed.keys() and "secret" in distributed.keys():
        s3_client = boto3.client(
            "s3",
            aws_access_key_id = distributed["key_"],
            aws_secret_access_key = distributed["secret"],
            region_name = distributed["region"]
        )
    else:
        s3_client = boto3.client(
            "s3",
            region_name = distributed["region"]
        )
    if "dir" in distributed.keys():
        path = "{}/{}/{}.{}".format(distributed["dir"], folder, name, ext)
    else:
        path = "{}/{}.{}".format(folder, name, ext)
        
    start_time = time()
    response = s3_client.get_object(
        Bucket = distributed["bucket"],
        Key = path
    )
    data = response["Body"].read()
    print("Download time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
    
    return data

def delete(name: str, token: str | None = None) -> None:
    distributed = get_creds(token)
    
    folders = [
        "datasets", "embeddings", "tokens"
    ]
    
    extensions = [
        "parquet", "pkl", "parquet"
    ]
    
    if "key_" in distributed.keys() and "secret" in distributed.keys():
        s3_client = boto3.client(
            "s3",
            aws_access_key_id = distributed["key_"],
            aws_secret_access_key = distributed["secret"],
            region_name = distributed["region"]
        )
    else:
        s3_client = boto3.client(
            "s3",
            region_name = distributed["region"]
        )
    
    for i in range(len(folders)):
        if "dir" in distributed.keys():
            path = "{}/{}/{}.{}".format(distributed["dir"], folders[i], name, extensions[i])
        else:
            path = "{}/{}.{}".format(folders[i], name, extensions[i])
            
        s3_client.delete_object(
            Bucket = distributed["bucket"],
            Key = path
        )
            