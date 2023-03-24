import pandas as pd
import sys
# APIs to backend server
import requests
import json
# These will let us use R packages:
from rpy2.robjects.packages import importr
from rpy2.robjects.packages import STAP
from rpy2.robjects import pandas2ri

BASE_URL = "http://localhost:8000"
TABLE_NAME = sys.argv[1]

# Get the data from a database table
def getTable(name):
    page = 1
    print("Page:", page)
    data = requests.get(BASE_URL + "/datasets/records/" + name + "/" + str(page))
    data = pd.DataFrame(json.loads(data.text))
    while page == 1 or len(curr.index) > 0:
        page += 1
        print("Page", page)
        curr = requests.get(BASE_URL + "/datasets/records/" + name + "/" + str(page))
        curr = pd.DataFrame(json.loads(curr.text))
        data = pd.merge(data, curr)
    return data

# Split the text and insert into database
def splitText(data):
    # Import split_text function from split.R
    with open("util/split.R", "r") as file:
        split_text = file.read()
    split_text = STAP(split_text, "split_text")

    # Split the text of the given data frame
    split_data = split_text.split_text(data, "text", "speaker")

# Convert pandas.DataFrames to R dataframes automatically.
pandas2ri.activate()

data = getTable(TABLE_NAME)
splitText(data)
