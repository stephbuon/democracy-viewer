import sys
import util.s3 as s3

TABLE_NAME = sys.argv[1]
DOWNLOAD_TYPE = sys.argv[2]

# Get distributed token if defined
try:
    TOKEN = sys.argv[3]
except:
    TOKEN = None

if DOWNLOAD_TYPE in ["both", "dataset"]:
    df_raw = s3.download("datasets", TABLE_NAME, TOKEN).collect()
    df_raw.to_pandas(use_pyarrow_extension_array=True).to_json("files/nodejs/datasets/{}.json".format(TABLE_NAME), "records", indent = 4)
    
if DOWNLOAD_TYPE in ["both", "tokens"]:
    df_split = s3.download("tokens", TABLE_NAME, TOKEN).collect()
    df_split.to_pandas(use_pyarrow_extension_array=True).to_json("files/nodejs/tokens/{}.json".format(TABLE_NAME), "records", indent = 4)
