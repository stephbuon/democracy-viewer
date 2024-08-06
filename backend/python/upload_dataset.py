import polars as pl
import sys
from time import time
import util.s3 as s3

# Get table name and file name from command line argument
TABLE_NAME = sys.argv[1]
FILE_NAME = sys.argv[2]

# Get distributed token if defined
try:
    TOKEN = sys.argv[3]
except:
    TOKEN = None

start_time = time()

# Upload file to s3
df = pl.read_csv(FILE_NAME)
s3.upload(df, "datasets", TABLE_NAME, TOKEN)

print("Upload time: {} seconds".format(time() - start_time))