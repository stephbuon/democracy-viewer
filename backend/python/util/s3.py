from boto3 import client
from boto3.s3.transfer import TransferConfig
from jwt import decode
from os import environ
from os.path import exists
from pandas import DataFrame, read_parquet
from s3fs import S3FileSystem
from time import time

BASE_PATH = "../files/s3/{}".format(environ.get("DB_VERSION"))

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
            "region": environ.get("S3_REGION"),
            "bucket": environ.get("S3_BUCKET"),
            "dir": environ.get("DB_VERSION"),
            "key_": environ.get("S3_KEY"),
            "secret": environ.get("S3_SECRET")
        }
        
    secret = environ.get("TOKEN_SECRET")
    return decode(token, secret, "HS256")

def upload(df: DataFrame, folder: str, name: str, token: str | None = None) -> None:
    distributed = get_creds(token)
    
    # Convert file to parquet
    start_time = time()
    local_file = "{}/{}/{}.parquet".format(BASE_PATH, folder, name)
    df.to_parquet(local_file, engine = "pyarrow", index = False)
    print("Conversion time: {} minutes".format((time() - start_time) / 60))
    
    # Upload file to s3
    if "key_" in distributed.keys() and "secret" in distributed.keys():
        s3_client = client(
            "s3",
            aws_access_key_id = distributed["key_"],
            aws_secret_access_key = distributed["secret"],
            region_name = distributed["region"]
        )
    else:
        s3_client = client(
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
    print("Upload time: {} minutes".format((time() - start_time) / 60))
    
def upload_file(folder: str, name: str, token: str | None = None) -> None:
    distributed = get_creds(token)

    # Upload file to s3
    if "key_" in distributed.keys() and "secret" in distributed.keys():
        s3_client = client(
            "s3",
            aws_access_key_id = distributed["key_"],
            aws_secret_access_key = distributed["secret"],
            region_name = distributed["region"]
        )
    else:
        s3_client = client(
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
    print("Upload time: {} minutes".format((time() - start_time) / 60))
    
def download(folder: str, name: str, token: str | None = None) -> DataFrame:
    distributed = get_creds(token)
    
    download_path = "{}/{}/{}.parquet".format(BASE_PATH, folder, name)
    if exists(download_path):
        # Do nothing if file already downloaded
        print("{} already exists".format(name))
        df = read_parquet(download_path, engine = "pyarrow")
    else:
        # Download file from s3
        if "key_" in distributed.keys() and "secret" in distributed.keys():
            # Create an S3 file system with credentials
            s3_client = S3FileSystem(
                key=distributed["key_"],
                secret=distributed["secret"],
                client_kwargs={'region_name': distributed["region"]}
            )
        else:
            s3_client = S3FileSystem(
                client_kwargs={'region_name': distributed["region"]}
            )
        if "dir" in distributed.keys():
            path = "{}/{}/{}.parquet".format(distributed["dir"], folder, name)
        else:
            path = "{}/{}.parquet".format(folder, name)
            
        start_time = time()
        df = read_parquet("s3://{}/{}".format(distributed["bucket"], path), engine='pyarrow', storage_options={
            "key":distributed["key_"],
            "secret":distributed["secret"],
            "client_kwargs":{'region_name': distributed["region"]}
        })
        print("Download time: {} minutes".format((time() - start_time) / 60))
    
    return df

def download_file(folder: str, name: str, token: str | None = None) -> str:
    distributed = get_creds(token)
    
    download_path = "{}/{}/{}".format(BASE_PATH, folder, name)
    if exists(download_path):
        # Do nothing if file already downloaded
        print("{} already exists".format(name))
    else:
        # Download file from s3
        if "key_" in distributed.keys() and "secret" in distributed.keys():
            s3_client = client(
                "s3",
                aws_access_key_id = distributed["key_"],
                aws_secret_access_key = distributed["secret"],
                region_name = distributed["region"]
            )
        else:
            s3_client = client(
                "s3",
                region_name = distributed["region"]
            )
        if "dir" in distributed.keys():
            path = "{}/{}/{}".format(distributed["dir"], folder, name)
        else:
            path = "{}/{}".format(folder, name)
            
        start_time = time()
        s3_client.download_file(
            distributed["bucket"],
            path,
            download_path,
            Config = config
        )
        print("Download time: {} minutes".format((time() - start_time) / 60))
    
    return download_path

def delete(name: str, token: str | None = None) -> None:
    distributed = get_creds(token)
    
    folders = [
        "datasets", "embeddings", "tokens"
    ]
    
    extensions = [
        "parquet", "pkl", "parquet"
    ]
    
    if "key_" in distributed.keys() and "secret" in distributed.keys():
        s3_client = client(
            "s3",
            aws_access_key_id = distributed["key_"],
            aws_secret_access_key = distributed["secret"],
            region_name = distributed["region"]
        )
    else:
        s3_client = client(
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
            