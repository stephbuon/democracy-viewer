from sys import argv
from util.s3 import download

TABLE_NAME = argv[1]
DOWNLOAD_TYPE = argv[2]

# Get distributed token if defined
try:
    TOKEN = argv[3]
except:
    TOKEN = None

if DOWNLOAD_TYPE in ["both", "dataset"]:
    df_raw = download("datasets", TABLE_NAME, TOKEN)
    df_raw["__id__"] = df_raw.index
    df_raw.to_json("files/nodejs/datasets/{}.json".format(TABLE_NAME), "records", indent = 4)
    
if DOWNLOAD_TYPE in ["both", "tokens"]:
    df_split = download("tokens", TABLE_NAME, TOKEN)
    df_split.to_json("files/nodejs/tokens/{}.json".format(TABLE_NAME), "records", indent = 4)
