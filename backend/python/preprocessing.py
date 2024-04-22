from copy import deepcopy
from dotenv import load_dotenv
from numpy import ceil
from pandas import DataFrame, concat, read_csv
from sys import argv, exit
from time import time
# Database interaction
from bcpandas import to_sql, SqlCreds
from sqlalchemy import create_engine, MetaData, select
# SQL helpers
from util.sql_connect import sql_connect
from util.sqlalchemy_tables import DatasetMetadata, DatasetSplitText, DatasetTextCols
# Word processing
from util.word_processing import lemmatize_nltk, stem_nltk

# Get table name from command line argument
TABLE_NAME = argv[1]
load_dotenv()

# Load distributed connection if defined
start_time = time.time()
conn_str, client = sql_connect()
engine = create_engine(conn_str)
meta = MetaData()
meta.reflect(engine)
print("Connection time: {} minutes".format((time.time() - start_time) / 60))

# Insert tokens into database
def insert_tokens(df: DataFrame):
    start = time.time()
    if client == "mssql":
        creds = SqlCreds.from_engine(engine)
        to_sql(
            df,
            DatasetSplitText.__tablename__,
            creds,
            index = False,
            if_exists = "append",
            batch_size = min(50000, len(df))
        )
    else:
        with engine.connect() as conn:
            df.to_sql(
                DatasetSplitText.__tablename__, 
                conn, 
                if_exists = "append", 
                index = False, 
                chunksize = min(50000, len(df))
            )
            conn.commit()
    print("Inserting data: {} minutes".format((time.time() - start) / 60))

# Split the text of the given data frame
def split_text(data: DataFrame):
    start = time.time()
    
    # Get metadata to determine preprocessing type
    query = (
        select(DatasetMetadata.preprocessing_type)
            .where(DatasetMetadata.table_name == TABLE_NAME)
    )
    with engine.connect() as conn:
        for row in conn.execute(query):
            preprocessing_type = row[0]
            break
        conn.commit()
        
    # Read and process stop words
    stopwords = read_csv("python/util/preprocessing/stopwords.csv")
    stopwords["stop_word"] = stopwords["stop_word"].str.lower().str.replace('\W', '', regex=True)
    # Stem stop words if using stemming
    if preprocessing_type == "stem":
        stopwords["stop_word"] = stopwords["stop_word"].apply(stem_nltk)
        stopwords = stopwords.explode("stop_word")
    stopwords = stopwords.drop_duplicates()
    
    # Create a deep copy of data
    split_data = deepcopy(data)
    # Lemmatize, stem, or split text based on preprocessing type
    if preprocessing_type == "lemma":
        split_data["text"] = split_data["text"].apply(lemmatize_nltk)
    elif preprocessing_type == "stem":
        split_data["text"] = split_data["text"].apply(stem_nltk)
    else:
        split_data["text"] = split_data["text"].str.split()
    # Create new row for each word
    split_data = split_data.explode("text")
    split_data["text"] = (
        split_data["text"]
            # Remove special characters
            .str.replace('\W', '', regex=True)
            # Make lowercase
            .str.lower()
        )
    
    # Remove empty values
    split_data = split_data[split_data["text"] != ""]
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
        select(DatasetMetadata.record_count)
            .where(DatasetMetadata.table_name == TABLE_NAME)
    )
    with engine.connect() as conn:
        for row in conn.execute(query):
            records = row[0]
            break
        conn.commit()
    PAGE_LENGTH = 50000
    PAGES = int(ceil(records / PAGE_LENGTH))
    # Get text columns
    query = (
        select(DatasetTextCols.col)
            .where(DatasetTextCols.table_name == TABLE_NAME)
    )
    text_cols = []
    with engine.connect() as conn:
        for row in conn.execute(query):
            text_cols.append(row[0])
        conn.commit()
    if len(text_cols) == 0:
        print("No text columns to process")
        exit(0)
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
            data = DataFrame({
                "id": list(map(lambda x: x[0], records)),
                "text": list(map(lambda x: x[1], records)),
                "col": col
            })
            df.append(data)
    df = concat(df)
    print("Loading data: {} minutes".format((time.time() - start) / 60))
    return df
              
data = get_data()
df = split_text(data)
print("Tokens processed: {}".format(len(df)))
insert_tokens(df)
print("Total time: {} minutes".format((time.time() - start_time) / 60))