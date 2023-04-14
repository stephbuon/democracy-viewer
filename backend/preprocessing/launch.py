# Python modules
import util.word_embeddings as word_embeddings

import pandas as pd
import sys
import math
# APIs to backend server
import requests
import json
from dotenv import load_dotenv
import os
# These will let us use R packages:
from rpy2.robjects.packages import STAP
from rpy2.robjects import pandas2ri
import rpy2.robjects as ro

load_dotenv()
BASE_URL = "http://localhost:8000"
TABLE_NAME = sys.argv[1]
HEADERS = {
    "Authorization": "Bearer " + os.environ.get("TOKEN")
}

# Get the data from a database table
def getTable():
    # Get the number of pages
    PER_PAGE = 50000
    pages = requests.get(BASE_URL + "/datasets/count/subset/" + TABLE_NAME)
    pages = math.ceil(int(pages.text) / PER_PAGE)

    # Get all dataset pages
    page = 1
    print("Page:", page)
    data = requests.get(BASE_URL + "/datasets/subset/" + TABLE_NAME + "/" + str(page) + "?pageLength=" + str(PER_PAGE))
    if data.status_code != 200:
        sys.exit(data.reason)
    data = pd.DataFrame(json.loads(data.text))
    while (page < pages):
        page += 1
        print("Page:", page)
        curr = requests.get(BASE_URL + "/datasets/subset/" + TABLE_NAME + "/" + str(page) + "?pageLength=" + str(PER_PAGE))
        if curr.status_code != 200:
            sys.exit(curr.reason)
        curr = pd.DataFrame(json.loads(curr.text))
        data = pd.concat([data, curr])

    # file = sys.argv[2]
    # data = pd.read_csv(file)
    # data["id"] = data.index

    return data

# Split the text and insert into database
def splitText(data):
    # Import split_text function from split.R
    # with open("preprocessing/util/split_text.R", "r") as file:
    #     split_text = file.read()
    # split_text = STAP(split_text, "split_text")

    # # Split the text of the given data frame
    # # Convert pandas.DataFrames to R dataframes automatically.
    # pandas2ri.activate()
    # split_data = split_text.split_text(data, "text")
    # split_data = ro.conversion.rpy2py(split_data)
    # split_data.to_csv("datasets/hansard_1870_split.csv", index = False)
    split_data = pd.read_csv("datasets/hansard_1870_split.csv")

    # Insert into db
    PER_PAGE = 50000
    page = 1
    print("Split Text:")
    for i in range(0, len(split_data.index), PER_PAGE):
        body = json.loads(split_data[i:(i + PER_PAGE)].to_json(orient = "records"))
        print("Page:", i, len(split_data.index))
        result = requests.post(BASE_URL + "/preprocessing/split/" + TABLE_NAME, json = body, headers = HEADERS)
        page += 1
        print(result.status_code, result.reason)
        if result.status_code != 201:
            sys.exit(result.reason)
    print("here")
    sys.exit()

    return split_data

# Compute word embeddings and insert into database
def wordEmbeddings(data):
    # Calculate word embeddings
    results = word_embeddings.word_embeddings(data)
    results.to_csv("datasets/hansard_1870_embedding.csv", index = False)

    # Insert into db
    PER_PAGE = 50000
    page = 1
    print("Word embeddings:")
    for i in range(0, len(results.index), PER_PAGE):
        body = json.loads(results[i:(i + PER_PAGE)].to_json(orient = "records"))
        print("Page:", page)
        result = requests.post(BASE_URL + "/preprocessing/embeddings/" + TABLE_NAME, json = body, headers = HEADERS)
        page += 1
        if result.status_code != 201:
            sys.exit(result.reason)
    print()

# Get dataset from db
# data = getTable()
data = None
# Split text and insert into db
split = splitText(data)
# Calculate word embeddings and insert into db
wordEmbeddings(split)
# Update metadata to mark as processed
body = {
    "processed": True
}
result = requests.put(BASE_URL + "/datasets/metadata/" + TABLE_NAME, json = body, headers = HEADERS)
if result.status_code != 200:
    sys.exit(result.reason)
