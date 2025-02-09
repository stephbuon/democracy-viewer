import json
import polars as pl
import sys
import util.s3 as s3
import util.sql_queries as sql
from util.sql_connect import sql_connect

PARAMS_FILE = sys.argv[1]

# Get distributed token if defined
try:
    TOKEN = sys.argv[2]
except:
    TOKEN = None

# Read params
params: dict = json.load(open(PARAMS_FILE))
# Download dataset
df = s3.download("datasets", params["table_name"], TOKEN)

# Function to replace text in the specified row and column
def replace_text(text):
    substr1 = text[:int(params["start"])]
    substr2 = text[int(params["end"]):]
    new_text = substr1 + str(params["new_text"]) + substr2
    return new_text

# Create a new LazyFrame with the edited text
df = df.with_columns(
    pl.when(pl.col("record_id") == int(params["record_id"]))  # Ensure to target the correct row
        .then(
            pl.col(params["col"]).map_elements(replace_text)
        )
        .otherwise(pl.col(params["col"]))
        .alias(params["col"])
)

# Download updated data frame
df = df.collect()

# Update SQL to disable dataset until upload is complete
engine, _ = sql_connect()
sql.deactivate_upload(engine, params["table_name"])

# Upload new data frame to s3
s3.upload(df, "datasets", params["table_name"], TOKEN)
