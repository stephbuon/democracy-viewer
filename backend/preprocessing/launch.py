# Python modules
import util.word_embeddings as word_embeddings

import pandas as pd
import sys
import math
import threading
# APIs to backend server
import requests
import json
from dotenv import load_dotenv
import os
import time
# These will let us use R packages:
from rpy2.robjects.packages import STAP
from rpy2.robjects import pandas2ri
import rpy2.robjects as ro
from rpy2.robjects.vectors import StrVector

load_dotenv()
BASE_URL = "http://localhost:8000"
TABLE_NAME = sys.argv[1]
HEADERS = {
    "Authorization": "Bearer " + os.environ.get("TOKEN")
}
embeddingCount = 0

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
        sys.exit(data.json())
    data = pd.DataFrame(json.loads(data.text))
    while (page < pages):
        page += 1
        print("Page:", page)
        curr = requests.get(BASE_URL + "/datasets/subset/" + TABLE_NAME + "/" + str(page) + "?pageLength=" + str(PER_PAGE))
        if curr.status_code != 200:
            sys.exit(curr.json())
        curr = pd.DataFrame(json.loads(curr.text))
        data = pd.concat([data, curr])

    return data

# Split the text and insert into database
def splitText(data):
    # Import split_text function from split.R
    with open("preprocessing/util/split_text.R", "r") as file:
        split_text = file.read()
    split_text = STAP(split_text, "split_text")

    # Get the dataset's text columns from the database
    text_cols = requests.get(BASE_URL + "/datasets/text/" + TABLE_NAME)
    if text_cols.status_code == 200:
        text_cols = json.loads(text_cols.text)
    else:
        sys.exit(text_cols.json())

    # Split the text of the given data frame
    # Convert pandas.DataFrames to R dataframes automatically.
    pandas2ri.activate()
    split_data = split_text.split_text(data, StrVector(text_cols))
    split_data = ro.conversion.rpy2py(split_data)
    split_data.to_csv("datasets/hansard_1870_split.csv", index = False)

    return split_data

# Insert all split text records into db
def insertSplits(split_data):
    PER_PAGE = 50000
    for i in range(0, len(split_data.index), PER_PAGE):
        body = json.loads(split_data[i:(i + PER_PAGE)].to_json(orient = "records"))
        resp = requests.post(BASE_URL + "/preprocessing/split/" + TABLE_NAME, json = body, headers = HEADERS)
        if (resp.status_code != 201):
            break

# Insert all word embedding records into db
def insertEmbeddings(embedding_data):
    PER_PAGE = 50000
    for i in range(0, len(embedding_data.index), PER_PAGE):
        body = json.loads(embedding_data[i:(i + PER_PAGE)].to_json(orient = "records"))
        resp = requests.post(BASE_URL + "/preprocessing/embeddings/" + TABLE_NAME, json = body, headers = HEADERS)
        if (resp.status_code != 201):
            break

# Compute word embeddings and insert into database
def wordEmbeddingsThread(data):
    # Calculate word embeddings
    start_time = time.time()
    print("Start word embeddings")
    embeddings = word_embeddings.word_embeddings(data)
    print("Embeddings calculated in " + str(time.time() - start_time) + " seconds")

    start_time = time.time()
    global embeddingCount
    embeddingCount = len(embeddings.len)
    insertEmbeddings(embeddings)
    # Verify that the number of split text records is correct
    check = requests.get(BASE_URL + "/preprocessing/embeddings/" + TABLE_NAME + "/count")
    if int(check.text) != len(embeddings.index):
        # Not all records were inserted
        success = False
        print(check.text + " out of " + str(len(embeddings.index)) + " word embedding records were uploaded")
        # Delete any records that were inserted
        requests.delete(BASE_URL + "/preprocessing/embeddings/" + TABLE_NAME)
    else:
        # All records were inserted
        print("Embeddings finished uploading in " + str(time.time() - start_time) + " seconds")

# Update metadata if completed
def updateMetadata():
    body = {
        "processed": True
    }
    result = requests.put(BASE_URL + "/datasets/metadata/" + TABLE_NAME, json = body, headers = HEADERS)
    if result.status_code != 200:
        sys.exit(result.json())

# Get dataset from db
data = getTable()
# Split text and insert into db
split = splitText(data)

# Create threads to insert split records and calculate word embeddings
t1 = threading.Thread(target = insertSplits, args = (split,))
t2 = threading.Thread(target = wordEmbeddingsThread, args = (split,))

# Start threads
t1.start()
t2.start()

# Wait until threads finish
t1.join()
# Verify that the number of split text records is correct
check = requests.get(BASE_URL + "/preprocessing/splits/" + TABLE_NAME + "/count")
if int(check.text) != len(split.index):
    # Not all records were inserted
    success = False
    print(check.text + " out of " + str(len(split.index)) + " split text records were uploaded")
    # Delete any records that were inserted
    requests.delete(BASE_URL + "/preprocessing/splits/" + TABLE_NAME)
    sys.exit()
t2.join()
# Verify that the number of word embedding records is correct
check = requests.get(BASE_URL + "/preprocessing/embeddings/" + TABLE_NAME + "/count")
if int(check.text) != embeddingCount:
    # Not all records were inserted
    success = False
    print(check.text + " out of " + str(embeddingCount) + " word embedding records were uploaded")
    # Delete any records that were inserted
    requests.delete(BASE_URL + "/preprocessing/embeddings/" + TABLE_NAME)
    sys.exit()

updateMetadata()
