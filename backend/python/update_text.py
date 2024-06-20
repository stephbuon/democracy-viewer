from json import load
from sys import argv
from util.s3 import download, upload

TABLE_NAME = argv[1]
PARAMS_FILE = argv[2]

# Download dataset
df = download("datasets", TABLE_NAME)
# Read params
params = load(open(PARAMS_FILE))

# Extract text to be edited
old_text = str(df.iat[params["row"], params["col"]])
# Edit the text
substr1 = old_text[:params["start"]]
substr2 = old_text[(params["end"] + 1):]
new_text = str(params["text"]).join([substr1, substr2])
# Replace text in data frame
df.iat[params["row"], params["col"]] = new_text

# Upload new data frame to s3
upload(df, "datasets", TABLE_NAME)
