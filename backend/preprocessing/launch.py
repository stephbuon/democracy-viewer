import pandas as pd
import numpy as np
import sys
from dotenv import load_dotenv
import copy
import os
import time
import io
# Database interaction
import pyodbc
from bcpandas import to_sql, SqlCreds
# Text mining
from nltk.corpus import wordnet as wn

# Get table name from command line argument
TABLE_NAME = sys.argv[1]

# Load environment variables
load_dotenv()
server = os.environ.get("HOST")
database = os.environ.get("DATABASE")
port = os.environ.get("PORT")
username = os.environ.get("DATABASE_USERNAME")
password = os.environ.get("PASSWORD")

# Connect to database
CONNECTION_STR = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER='+server+','+port+';DATABASE='+database+';UID='+username+';PWD='+ password
conn = pyodbc.connect(CONNECTION_STR)
cursor = conn.cursor()

# Insert tokens into database
def insert_tokens(df: pd.DataFrame):
    start = time.time()
    creds = SqlCreds(server, database, username, password, 18, port)
    # Suppress printed output
    text_trap = io.StringIO()
    sys.stdout = text_trap
    # Insert data into database
    to_sql(
        df,
        "dataset_split_text",
        creds,
        index = False,
        if_exists = "append",
        batch_size = 50000
    )
    # Allow printing again
    sys.stdout = sys.__stdout__
    print("Inserting data: {} minutes".format((time.time() - start) / 60))

# Split the text of the given data frame
def split_text(data: pd.DataFrame):
    start = time.time()
    # Read and process stop words
    stopwords = pd.read_csv("preprocessing/util/stopwords.csv")
    stopwords["stop_word"] = stopwords["stop_word"].str.lower().str.replace('\W', '', regex=True).apply(wn.morphy)
    stopwords = stopwords.drop_duplicates()
    # Create a deep copy of data
    split_data = copy.deepcopy(data)
    # Make lowercase and split into words
    split_data["text"] = split_data["text"].str.lower().str.split()
    # Create new row for each word in each record
    split_data = split_data.explode("text")
    # Remove special characters and lemmatize
    split_data["text"] = split_data["text"].str.replace('\W', '', regex=True).apply(wn.morphy)
    # Get counts of each word in each record
    split_data = split_data.groupby(["id", "text", "col"]).size().reset_index(name='count')
    # Remove stop words and missing data
    split_data = split_data[~split_data["text"].isin(stopwords["stop_word"])].dropna()
    # Add missing columns for adding to database
    split_data["table_name"] = TABLE_NAME
    # Rename columns to match database names
    split_data = split_data.rename(
        columns = {
            "id": "record_id",
            "text": "word"
        }
    )
    print("Data processing: {} minutes".format((time.time() - start) / 60))
    return split_data
    
# Get data out of database
def get_data():
    start = time.time()
    # Get number of records and calculate number of pages
    cursor.execute("SELECT COUNT(*) FROM {}".format(TABLE_NAME))
    records = cursor.fetchall()
    records = records[0][0]
    PAGE_LENGTH = 50000
    PAGES = int(np.ceil(records / PAGE_LENGTH))
    # Get text columns
    cursor.execute("SELECT col FROM dataset_text_cols WHERE table_name = ?", TABLE_NAME)
    text_cols = cursor.fetchall()
    text_cols = list(map(lambda x: x[0], text_cols))
    # Array to store all processing threads
    df = []
    for col in text_cols:
        for page in range(PAGES):
            # Get next 50,000 records from db
            QUERY = '''
                SELECT id, {} FROM {}
                ORDER BY id
                OFFSET ? ROWS
                FETCH NEXT ? ROWS ONLY
            '''.format(col, TABLE_NAME)
            cursor.execute(QUERY, page * PAGE_LENGTH, PAGE_LENGTH)
            records = cursor.fetchall()
            data = pd.DataFrame({
                "id": list(map(lambda x: x[0], records)),
                "text": list(map(lambda x: x[1], records)),
                "col": col
            })
            df.append(data)
    df = pd.concat(df)
    print("Loading data: {} minutes".format((time.time() - start) / 60))
    return df
              
start_time = time.time()
data = get_data()
df = split_text(data)
print("Tokens processed: {}".format(len(df)))
insert_tokens(df)
cursor.close()
conn.close()
print("Total time: {} minutes".format((time.time() - start_time) / 60))