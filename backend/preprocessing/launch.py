import pandas as pd
import numpy as np
import sys
from dotenv import load_dotenv
import copy
import os
import time
import jwt
# Database interaction
# import pyodbc
# from bcpandas import to_sql, SqlCreds
from sqlalchemy import create_engine, MetaData, select
# Update directory to import util
import util.sql_alchemy_tables as tables
# Text mining
from nltk.corpus import wordnet as wn

# Get table name from command line argument
TABLE_NAME = sys.argv[1]

# Load distributed connection if defined
start_time = time.time()
try:
    DB_CREDS_TOKEN = sys.argv[2]
except:
    DB_CREDS_TOKEN = None
if DB_CREDS_TOKEN != None:
    secret = os.environ.get("TOKEN_SECRET")
    DB_CREDS = jwt.decode(DB_CREDS_TOKEN, secret, "HS256")
else: 
    DB_CREDS = None

if DB_CREDS == None:
    # Connect to default database if no distributed connection
    # Load environment variables
    host = os.environ.get("HOST")
    database = os.environ.get("DATABASE")
    port = os.environ.get("PORT")
    username = os.environ.get("DATABASE_USERNAME")
    password = os.environ.get("PASSWORD")

    # Connect to database
    conn_str = "mssql+pyodbc://{}:{}@{}:{}/{}".format(
        username, password, host, port, database
    )
else:
    # Connect to distributed connection
    client = DB_CREDS["client"]
    creds = { key: DB_CREDS[key] for key in ["host", "db", "port", "username", "password"]}
    # Create connection for client
    if client == "mssql":
        conn_str = "mssql+pyodbc://"
    elif client == "mysql":
        conn_str = "mysql+pymysql://"
    else:
        raise Exception("Unrecognized client:", client)
    conn_str += creds["username"]
    if "password" in creds.keys():
        conn_str += ":{}".format(creds["password"])
    conn_str += "@{}".format(creds["host"])
    if "port" in creds.keys():
        conn_str += ":{}".format(creds["port"])
    conn_str += "/{}".format(creds["db"])
        
engine = create_engine(conn_str)
meta = MetaData()
meta.reflect(engine)
print("Connection time: {} minutes".format((time.time() - start_time) / 60))

# Insert tokens into database
def insert_tokens(df: pd.DataFrame):
    start = time.time()
    with engine.connect() as conn:
        df.to_sql(tables.DatasetSplitText.__tablename__, conn, if_exists = "append", index = False)
        conn.commit()
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
    query = (
        select(tables.DatasetMetadata.record_count)
            .where(tables.DatasetMetadata.table_name == TABLE_NAME)
    )
    with engine.connect() as conn:
        for row in conn.execute(query):
            records = row[0]
            break
        conn.commit()
    PAGE_LENGTH = 50000
    PAGES = int(np.ceil(records / PAGE_LENGTH))
    # Get text columns
    # cursor.execute("SELECT col FROM dataset_text_cols WHERE table_name = ?", TABLE_NAME)
    # text_cols = cursor.fetchall()
    query = (
        select(tables.DatasetTextCols.col)
            .where(tables.DatasetTextCols.table_name == TABLE_NAME)
    )
    text_cols = []
    with engine.connect() as conn:
        for row in conn.execute(query):
            text_cols.append(row[0])
        conn.commit()
    if len(text_cols) == 0:
        print("No text columns to process")
        sys.exit(0)
    # Get table from metadata
    table = meta.tables[TABLE_NAME]
    # Array to store all processing threads
    df = []
    for col in text_cols:
        for page in range(PAGES):
            # Get next 50,000 records from db
            query = (
                select(table.c.get("id"), table.c.get(col))
                    .order_by(table.c.get("id"))
                    .offset(page * PAGE_LENGTH)
                    .limit(PAGE_LENGTH)
            )
            records = []
            with engine.connect() as conn:
                for row in conn.execute(query):
                    records.append(row)
                conn.commit()
            data = pd.DataFrame({
                "id": list(map(lambda x: x[0], records)),
                "text": list(map(lambda x: x[1], records)),
                "col": col
            })
            df.append(data)
    df = pd.concat(df)
    print("Loading data: {} minutes".format((time.time() - start) / 60))
    return df
              
data = get_data()
df = split_text(data)
print("Tokens processed: {}".format(len(df)))
insert_tokens(df)
print("Total time: {} minutes".format((time.time() - start_time) / 60))