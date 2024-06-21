from pandas import read_csv
from sys import argv
from time import time
from util.s3 import upload

# Get table name and file name from command line argument
TABLE_NAME = argv[1]
FILE_NAME = argv[2]

# Get distributed token if defined
try:
    TOKEN = argv[3]
except:
    TOKEN = None

start_time = time()

# Upload file to s3
df = read_csv(FILE_NAME)
upload(df, "datasets", TABLE_NAME, TOKEN)

print("Upload time: {} seconds".format(time() - start_time))