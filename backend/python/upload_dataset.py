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
df = pl.read_csv(FILE_NAME)
# Convert all columns to strings
df = df.cast(pl.Utf8)
# Add record id column
df = df.with_row_index("record_id")
# Update metadata with record count
engine, _ = sql_connect()
sql.set_num_records(engine, TABLE_NAME, len(df))
# Upload to S3
s3.upload(df, "datasets", TABLE_NAME, TOKEN)

print("Upload time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))