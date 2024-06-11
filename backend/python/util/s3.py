from pandas import DataFrame, read_parquet
from boto3 import client
from os import environ
from os.path import exists

BASE_PATH = "files/s3/{}".format(environ.get("DB_VERSION"))

def upload(df: DataFrame, folder: str, name: str) -> None:
    local_file = "{}/{}/{}.parquet".format(BASE_PATH, folder, name)
    df.to_parquet(local_file, engine = "pyarrow", index = False)
    s3_client = client(
        "s3",
        aws_access_key_id = environ.get("S3_KEY"),
        aws_secret_access_key = environ.get("S3_SECRET"),
        region_name = environ.get("S3_REGION")
    )
    s3_client.upload_file(
        local_file,
        environ.get("S3_BUCKET"),
        "{}/{}/{}.parquet".format(environ.get("DB_VERSION"), folder, name)
    )
    
def download(folder: str, name: str) -> DataFrame:
    download_path = "{}/{}/{}.parquet".format(BASE_PATH, folder, name)
    if exists(download_path):
        print("{} already exists".format(name))
    else:
        print("Here")
        s3_client = client(
            "s3",
            aws_access_key_id = environ.get("S3_KEY"),
            aws_secret_access_key = environ.get("S3_SECRET"),
            region_name = environ.get("S3_REGION")
        )
        s3_client.download_file(
            environ.get("S3_BUCKET"),
            "{}/{}/{}.parquet".format(environ.get("DB_VERSION"), folder, name),
            download_path
        )
    
    return read_parquet(download_path, engine = "pyarrow")

def delete(name: str) -> None:
    folders = [
        "datasets", "embeddings", "tokens"
    ]