from collections import Counter
from copy import deepcopy
from dotenv import load_dotenv
from pandas import DataFrame, concat, read_csv
from sys import argv
from time import time
# Database interaction
from sqlalchemy import create_engine, MetaData
from util.s3 import upload, download
# SQL helpers
from util.sql_connect import sql_connect
import util.sql_queries as queries
# Word processing
from util.spacy_models import load_spacy_model
from util.word_processing import stem

# Get table name from command line argument
TABLE_NAME = argv[1]
load_dotenv()

# Load distributed connection if defined
start_time = time()
try:
    DB_CREDS_TOKEN = argv[2]
except:
    DB_CREDS_TOKEN = None
conn_str, client = sql_connect(DB_CREDS_TOKEN)
engine = create_engine(conn_str)
meta = MetaData()
meta.reflect(engine)
print("Connection time: {} minutes".format((time() - start_time) / 60))

# Extract lemmas, pos, and dependencies from tokens
def process_sentence(text: str, nlp = load_spacy_model()):
    doc = nlp(text)
    counter = Counter((
        token.lemma_.lower(), token.pos_.lower(), token.tag_.lower(), 
        token.dep_.lower(), token.head.lemma_.lower()
    ) for token in doc)
    return counter

# Convert the counter objects to a DataFrame with separate columns
def expand_counter(row):
    return [{
            "id": row["id"], "col": row["col"], "word": word_pos[0], 
            "pos": word_pos[1], "tag": word_pos[2], "dep": word_pos[3], "head": word_pos[4],
            "count": count
        }
        for word_pos, count in row["processed"].items() if word_pos[0] is not None
    ]
    
# Retrieve data from s3 and keep required data
def get_text() -> DataFrame:
    start = time()
    
    # Get all text columns
    text_cols = queries.get_text_cols(engine, TABLE_NAME)
    
    # Download raw data from s3
    df_raw = download("datasets", TABLE_NAME)
    # Reformat data to prep for preprocessing
    df = []
    for col in text_cols:
        df.append(DataFrame({
            "id": df_raw.index,
            "text": df_raw[col],
            "col": col
        }))
    df = concat(df)
    
    print("Loading data: {} seconds".format(time() - start))
    
    return df

# Split the text of the given data frame
def split_text(data: DataFrame):
    start = time()
    
    # Get metadata to determine preprocessing type
    metadata = queries.get_metadata(engine, meta, TABLE_NAME)
        
    # Read and process stop words
    stopwords = read_csv("python/util/stopwords.csv")
    stopwords["stop_word"] = stopwords["stop_word"].str.lower().str.replace("\W", "", regex=True)
    # Stem stop words if using stemming
    if metadata["preprocessing_type"] == "stem":
        stopwords["stop_word"] = stopwords["stop_word"].apply(lambda x: stem(x, metadata["language"]))
        stopwords = stopwords.explode("stop_word")
    stopwords = stopwords.drop_duplicates()
    
    # Create a deep copy of data
    split_data = deepcopy(data)
    # Lemmatize, stem, or split text based on preprocessing type
    if metadata["preprocessing_type"] == "lemma":
        # Load spacy language
        nlp = load_spacy_model(metadata["language"])
        
        # Create new row for each word
        split_data["processed"] = split_data["text"].apply(lambda x: process_sentence(x, nlp))
        split_data = concat([DataFrame(expand_counter(row)) for _, row in split_data.iterrows()], ignore_index=True)
        
        # Remove words with unwanted pos
        split_data = split_data[~split_data["pos"].isin(["num", "part", "punct", "sym", "x"])].dropna()
    else:
        if metadata["preprocessing_type"] == "stem":
            split_data["text"] = split_data["text"].apply(lambda x: stem(x, metadata["language"]))
        elif metadata["preprocessing_type"] == "none":
            split_data["text"] = split_data["text"].str.split()
            
        # Create a new row for each word
        split_data = split_data.explode("text")
        split_data["text"] = (
            split_data["text"]
                # Remove special characters
                .str.replace("\W", "", regex=True)
                # Make lowercase
                .str.lower()
            )
        
        # Remove empty values
        split_data = split_data[split_data["text"] != ""]
        # Get counts of each word in each record
        split_data = split_data.groupby(["id", "text", "col"]).size().reset_index(name="count")
        split_data = split_data.rename(columns = {"text": "word"})
        
    # Remove stop words and missing data
    split_data = split_data[~split_data["word"].isin(stopwords["stop_word"])].dropna()
    # Add missing columns for adding to database
    split_data["table_name"] = TABLE_NAME
    # Rename columns to match database names
    split_data = split_data.rename(columns = {"id": "record_id"})
    
    print("Data processing: {} minutes".format((time() - start) / 60))
    return split_data

# Upload data to s3
def upload_result(df: DataFrame):
    start_time = time()
    upload(df, "tokens", TABLE_NAME)
    print("Upload time: {} seconds".format(time() - start_time))
              
data = get_text()
df = split_text(data)
print("Tokens processed: {}".format(len(df)))
print("Total time: {} minutes".format((time() - start_time) / 60))