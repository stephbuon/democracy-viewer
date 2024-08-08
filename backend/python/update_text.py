import json
import polars as pl
import sys
import util.s3 as s3

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
col_name = df.collect_schema().names()[int(params["col"])]

# Function to replace text in the specified row and column
def replace_text(text):
    substr1 = text[:int(params["start"])]
    substr2 = text[int(params["end"]):]
    new_text = substr1 + str(params["new_text"]) + substr2
    return new_text

# Create a new LazyFrame with the edited text
df = df.with_columns(
    pl.when(pl.col("__id__") == int(params["record_id"]))  # Ensure to target the correct row
    .then(
        pl.col(col_name).map_elements(replace_text)
    )
    .otherwise(pl.col(col_name))
    .alias(col_name)
)
df = df.select([ col for col in df.columns if col != "__id__"])

# Upload new data frame to s3
s3.upload(df.collect(), "datasets", params["table_name"], TOKEN)
