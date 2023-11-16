import pandas as pd
import numpy as np
import sys
import threading
import copy
# APIs to backend server
import pyodbc
import sqlalchemy
from dotenv import load_dotenv
import os
import time
# These will let us use R packages:
from rpy2.robjects.packages import STAP
from rpy2.robjects import pandas2ri
import rpy2.robjects as ro
# Text mining
from nltk.corpus import wordnet as wn
import re

# python3 launch_parallel.py hansard_1870_1695167260301

load_dotenv()
TABLE_NAME = sys.argv[1]
if len(sys.argv) > 2:
    MAX_THREADS = int(sys.argv[2])
else:
    MAX_THREADS = 10

# Import split_text function from split.R
# with open("util/split_text.R", "r") as file:
#     split = file.read()
# split = STAP(split, "split_text")

server = os.environ.get("HOST")
database = os.environ.get("DATABASE")
port = os.environ.get("PORT")
username = os.environ.get("DATABASE_USERNAME")
password = os.environ.get("PASSWORD")

CONNECTION_STR = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER='+server+','+port+';DATABASE='+database+';UID='+username+';PWD='+ password
conn = pyodbc.connect(CONNECTION_STR)
cursor = conn.cursor()
cursor.fast_executemany = True

def insert_splits(data: pd.DataFrame, col: str):
    # Create sqlalchemy engine
    engine = sqlalchemy.create_engine('mssql+pyodbc:///?odbc_connect={}'.format(CONNECTION_STR))
    # Add missing columns for adding to database
    data["table_name"] = TABLE_NAME
    data["col"] = col
    # Rename columns to match database names
    data = data.rename(
        columns = {
            "id": "record_id",
            "text": "word"
        }
    )
    # Insert into database
    data.to_sql(
        name = "dataset_split_text",
        con = engine,
        chunksize = int(2100 / 5) - 1,
        if_exists = "append",
        method = "multi",
        index = False
    )

# Split the text of the given data frame
def split_text(data: pd.DataFrame, col: str):
    # Read and process stop words
    stopwords = pd.read_csv("util/stopwords.csv")
    stopwords["stop_word"] = stopwords["stop_word"].str.lower().str.replace('\W', '', regex=True).apply(wn.morphy)
    stopwords = stopwords.drop_duplicates()
    # Create a deep copy of data
    split_data = copy.deepcopy(data)
    # Make lowercase and split into words
    split_data[col] = split_data[col].str.lower().str.split()
    # Create new row for each word in each record
    split_data = split_data.explode(col)
    # Remove special characters and lemmatize
    split_data[col] = split_data[col].str.replace('\W', '', regex=True).apply(wn.morphy)
    # Get counts of each word in each record
    split_data = split_data.groupby(["id", col]).size().reset_index(name='count')
    # Remove stop words and missing data
    split_data = split_data[~split_data[col].isin(stopwords["stop_word"])].dropna()
    # Insert records into database
    insert_splits(split_data, col)

def split_text_thread(data: pd.DataFrame, col: str, page: int, pages: int):
    try:
        start = time.time()
        print("Started page {} of {} for column `{}`".format(page+1, pages, col))
        split_text(data, col)
        print("Completed page {} of {} for column `{}` in {} minutes".format(page+1, pages, col, (time.time() - start) / 60))
    except Exception as e:
        print(e)
        os._exit(1)
    
def get_data():
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
    threads = []
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
            df = pd.DataFrame({
                "id": list(map(lambda x: x[0], records)),
                "text": list(map(lambda x: x[1], records))
            })
            # Create new thread to process page
            index = len(threads)
            threads.append(threading.Thread(target = split_text_thread, args = (df, col, page, PAGES)))
            curr_threads = threading.active_count()
            while(curr_threads > MAX_THREADS):
                time.sleep(2)
                curr_threads = threading.active_count()
            threads[index].start()
    # Wait until all threads are done
    for thread in threads:
        thread.join()
            
  
               
start_time = time.time()
get_data()
print("Dataset preprocessed in {} seconds".format(time.time() - start_time))

cursor.close()
conn.close()