import datetime as dt
import humanize
import polars as pl
import sys
from time import time
import util.s3 as s3
from util.sql_connect import sql_connect
import util.sql_queries as sql

# Get table name and file name from command line argument
TABLE_NAME = sys.argv[1]
FILE_NAME = sys.argv[2]

# Get distributed token if defined
try:
    TOKEN = sys.argv[3]
except:
    TOKEN = None

start_time = time()

# Read file and add record id columns
df = pl.read_csv(FILE_NAME, infer_schema=False)
# Replace spaces in column names with an underscore
cols = df.columns
new_cols = { col: col.replace(" ", "_") for col in cols if " " in col}
df = df.rename(new_cols)
# Rename any column called "record_id"
if "record_id" in df.columns:
    df = df.rename({ "record_id": "record_id_" })
# Drop columns with no name
for col in df.columns:
    if len(col.strip()) == 0:
        df = df.drop(col)
# Add record id column
df = df.with_row_index("record_id")
# Update metadata with record count
engine, _ = sql_connect()
sql.set_num_records(engine, TABLE_NAME, len(df))
# Upload to S3
s3.upload(df, "datasets", TABLE_NAME, TOKEN)

print("Upload time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))