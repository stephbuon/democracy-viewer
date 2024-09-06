import boto3
from boto3.s3.transfer import TransferConfig
from botocore.exceptions import ClientError
import datetime as dt
import hashlib
import humanize
import jwt
import os
import polars as pl
from time import sleep, time

BASE_PATH = "files/s3"

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
            "key_": os.environ.get("S3_KEY"),
            "secret": os.environ.get("S3_SECRET")
        }
        
    secret = os.environ.get("TOKEN_SECRET")
    return jwt.decode(token, secret, "HS256")

def hash_query(query: str):
    return hashlib.md5(query.encode()).hexdigest()

def submit_athena_query(athena_client, query: str) -> str:
    print(query)
    response = athena_client.start_query_execution(
        QueryString = query,
        QueryExecutionContext = {
            "Database": os.environ.get("ATHENA_DB")
        },
        ResultConfiguration = {
            "OutputLocation": os.environ.get("ATHENA_OUTPUT")
        }
    )

    return response["QueryExecutionId"]

def wait_athena_query(athena_client, query_execution_id: str) -> str:
    while True:
        response = athena_client.get_query_execution(QueryExecutionId = query_execution_id)
        status = response["QueryExecution"]["Status"]["State"]
        
        if status in ["SUCCEEDED", "FAILED", "CANCELLED"]:
            return status
        sleep(0.1)
        
def rename_file(old_file: str, new_file: str, token: str | None):
    distributed = get_creds(token)
    
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
    
    # Copy the file to the new location
    copy_source = {"Bucket": distributed["bucket"], "Key": old_file}
    s3_client.copy_object(
        CopySource=copy_source, 
        Bucket=distributed["bucket"], 
        Key=new_file
    )
    
    # Delete the original file
    s3_client.delete_object(Bucket=distributed["bucket"], Key=old_file)
    
def check_file_exists(path: str, token: str | None):
    distributed = get_creds(token)
    
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
        
    try:
        s3_client.head_object(Bucket=distributed["bucket"], Key=path)
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            # The key does not exist.
            return False
        else:
            # Something else has gone wrong.
            raise 
        
    return True

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
        
    path = "tables/{}_{}/{}.parquet".format(folder, name, name)
        
    start_time = time()
    s3_client.upload_file(
        local_file,
        distributed["bucket"],
        path,
        Config = config
    )
    print("Upload time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
    
def upload_file(local_folder: str, s3_folder: str, name: str, token: str | None = None) -> None:
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
        
    local_file = "{}/{}/{}".format(BASE_PATH, local_folder, name)
    path = "{}/{}".format(s3_folder, name)
      
    start_time = time()  
    s3_client.upload_file(
        local_file,
        distributed["bucket"],
        path,
        Config = config
    )
    print("Upload time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
    
def download(query: str, token: str | None = None) -> pl.LazyFrame:
    distributed = get_creds(token)
    
    query_filename = hash_query(query)
    local_path = "{}/athena/{}.csv".format(BASE_PATH, query_filename)
    
    if not os.path.exists(local_path):
        if not check_file_exists(local_path, token):
            athena_client = boto3.client(
                "athena",
                aws_access_key_id = distributed["key_"],
                aws_secret_access_key = distributed["secret"],
                region_name = distributed["region"]
            )
            
            start_time = time()
            query_id = submit_athena_query(athena_client, query)
            status = wait_athena_query(athena_client, query_id)
            print("Athena query time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
            
            if status.lower() != "succeeded":
                raise Exception("Query failed with status {}".format(status))
        
            rename_file("athena/{}.csv".format(query_id), "athena/{}.csv".format(query_filename), token)
        download_file(local_path, "athena", "{}.csv".format(query_filename), token)
        
    df = pl.scan_csv(local_path)
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
    path = "{}/{}.{}".format(folder, name, ext)
        
    start_time = time()
    response = s3_client.get_object(
        Bucket = distributed["bucket"],
        Key = path
    )
    data = response["Body"].read()
    print("Download time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))
    
    return data

def download_file(local_file: str, folder: str, name: str, token: str | None = None) -> str:
    distributed = get_creds(token)
    
    if os.path.exists(local_file):
        # Do nothing if file already downloaded
        print("{} already exists".format(local_file))
    else:
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
        path = "{}/{}".format(folder, name)
            
        start_time = time()
        s3_client.download_file(
            distributed["bucket"],
            path,
            local_file,
            Config = config
        )
        print("Download time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))

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
        path = "{}/{}.{}".format(folders[i], name, extensions[i])
            
        s3_client.delete_object(
            Bucket = distributed["bucket"],
            Key = path
        )
            