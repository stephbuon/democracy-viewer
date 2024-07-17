from json import load
from sys import argv
from util.s3 import download, upload

PARAMS_FILE = argv[1]

# Get distributed token if defined
try:
    TOKEN = argv[3]
except:
    TOKEN = None

# Read params
params = load(open(PARAMS_FILE))
# Download dataset
df = download("datasets", params["table_name"], TOKEN)

# Extract text to be edited
old_text = str(df.iat[int(params["record_id"]), int(params["col"])])
# Edit the text
substr1 = old_text[:int(params["start"])]
substr2 = old_text[int(params["end"]):]
new_text = substr1 + str(params["new_text"]) + substr2
print(old_text)
print(substr1)
print(substr2)
print(new_text)
# Replace text in data frame
df.iat[int(params["record_id"]), int(params["col"])] = new_text

# Upload new data frame to s3
upload(df, "datasets", params["table_name"], TOKEN)
