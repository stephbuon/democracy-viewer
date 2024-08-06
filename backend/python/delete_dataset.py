import sys
from time import time
from util.s3 import delete

# Get table name and file name from command line argument
TABLE_NAME = sys.argv[1]

# Get distributed token if defined
try:
    TOKEN = sys.argv[2]
except:
    TOKEN = None

start_time = time()

# Delete file from s3
delete(TABLE_NAME, TOKEN)

print("Delete time: {} seconds".format(time() - start_time))