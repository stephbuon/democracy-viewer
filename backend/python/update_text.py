from json import load
from sys import argv
from util.s3 import download, upload

TABLE_NAME = argv[1]
PARAMS_FILE = argv[2]

# Download dataset
df = download("datasets", TABLE_NAME)
# Read params
params = load(open(PARAMS_FILE))
print(params)

# Extract text to be edited
old_text = str(df.iat[params["row"], params["col"]])
# Edit the text
new_text = str(params["text"]).join([old_text[:params["start"]], old_text[params["end"]:]])
# Replace text in data frame
df.iat[params["row"], params["col"]] = new_text

# Upload new data frame to s3
upload(df, "datasets", TABLE_NAME)
