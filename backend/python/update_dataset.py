import datetime as dt
import humanize
import polars as pl
import sys
from time import time
import util.s3 as s3
from util.sql_connect import sql_connect
import util.sql_queries as sql

engine, meta = sql_connect()

# Get table name and file name from command line argument
TABLE_NAME = sys.argv[1]
FILE_NAME = sys.argv[2]

# Get distributed token if defined
try:
    TOKEN = sys.argv[3]
except:
    TOKEN = None

start_time = time()

# Collect dataset metadata
metadata = sql.get_metadata(engine, meta, TABLE_NAME)

# Read file and add record id columns
df = pl.read_csv(FILE_NAME, infer_schema=False)
# Rename any column called "record_id"
if "record_id" in df.columns:
    df = df.rename({ "record_id": "record_id_" })
# Drop columns with no name
for col in df.columns:
    if len(col.strip()) == 0:
        df = df.drop(col)
# Add record id column with offset based on number of records in old dataset
df = df.with_row_index("record_id", offset = metadata["num_records"])
# Update metadata with record count
sql.set_num_records(engine, TABLE_NAME, metadata["num_records"] + len(df))
# Upload to S3
s3.upload(df, "datasets", TABLE_NAME, TOKEN)

print("Upload time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))