# Python modules
import util.word_embeddings as word_embeddings

import pandas as pd
import sys
import numpy as np
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
    # page = 1
    # print("Page:", page)
    # data = requests.get(BASE_URL + "/datasets/records/" + TABLE_NAME + "/" + str(page))
    # data = pd.DataFrame(json.loads(data.text))
    # while (page == 1 or len(curr.index) > 0):
    #     page += 1
    #     print("Page", page)
    #     curr = requests.get(BASE_URL + "/datasets/records/" + TABLE_NAME + "/" + str(page))
    #     curr = pd.DataFrame(json.loads(curr.text))
    #     data = pd.concat([data, curr])

    file = sys.argv[2]
    data = pd.read_csv(file)
    data["id"] = data.index

    return data

# Split the text and insert into database
def splitText(data):
    # Import split_text function from split.R
    with open("preprocessing/util/split_text.R", "r") as file:
        split_text = file.read()
    split_text = STAP(split_text, "split_text")

    # Split the text of the given data frame
    # Convert pandas.DataFrames to R dataframes automatically.
    pandas2ri.activate()
    split_data = split_text.split_text(data, "text")
    split_data = ro.conversion.rpy2py(split_data)

    # for i in range(0, len(split_data.index), 50000):
    #     body = json.loads(split_data[i:(i + 50000)].to_json(orient = "records"))
    #     requests.post(BASE_URL + "/preprocessing/split/" + TABLE_NAME, data = body, headers = HEADERS)
    split_data.to_csv("datasets/hansard_test_split.csv", index = False)

    return split_data

# Compute word embeddings and insert into database
def wordEmbeddings(data):
    # Calculate word embeddings
    results = word_embeddings.word_embeddings(data)
    print(results.head())

    # Insert into db
    # for i in range(0, len(results.index), 50000):
    #     body = json.loads(results[i:(i + 50000)].to_json(orient = "records"))
    #     requests.post(BASE_URL + "/preprocessing/embeddings/" + TABLE_NAME, data = body, headers = HEADERS)

data = getTable()
split = splitText(data)
wordEmbeddings(split)

# python3 launch.py hansard_1870_1679632154914