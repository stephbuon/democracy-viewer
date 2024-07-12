from time import time
start_time = time()
from collections import Counter
from copy import deepcopy
from dotenv import load_dotenv
from pandas import DataFrame, concat, read_csv
from sys import argv
from util.email import send_email
# Database interaction
from util.s3 import upload
# SQL helpers
from util.sql_connect import sql_connect
import util.data_queries as data
import util.sql_queries as sql
# Word processing
from util.spacy_models import load_spacy_model
from util.word_processing import stem
from util.embeddings_save import compute_embeddings
print("Import time: {} seconds".format(time() - start_time))

# Get table name from command line argument
TABLE_NAME = argv[1]
load_dotenv()

# Get distributed token if defined
try:
    TOKEN = argv[2]
except:
    TOKEN = None

engine, meta = sql_connect()

# Get metadata to determine preprocessing type
metadata = sql.get_metadata(engine, meta, TABLE_NAME)

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

# Split the text of the given data frame
def split_text(df: DataFrame):
    start = time()
        
    # Read and process stop words
    stopwords = read_csv("python/util/stopwords.csv")
    stopwords["stop_word"] = stopwords["stop_word"].str.lower().str.replace("\W", "", regex=True)
    # Stem stop words if using stemming
    if metadata["preprocessing_type"] == "stem":
        stopwords["stop_word"] = stopwords["stop_word"].apply(lambda x: stem(x, metadata["language"]))
        stopwords = stopwords.explode("stop_word")
    stopwords = stopwords.drop_duplicates()
    
    # Create a deep copy of data
    split_data = deepcopy(df)
    # Lemmatize, stem, or split text based on preprocessing type
    if metadata["preprocessing_type"] == "lemma":
        # Load spacy language
        nlp = load_spacy_model(metadata["language"])
        
        # Create new row for each word
        split_data["processed"] = split_data["text"].apply(lambda x: process_sentence(x, nlp))
        split_data = concat([DataFrame(expand_counter(row)) for _, row in split_data.iterrows()], ignore_index=True)
        
        # Remove words with unwanted pos
        split_data = split_data[~split_data["pos"].isin(["num", "part", "punct", "sym", "x", "space"])].dropna()
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
    upload(df, "tokens", TABLE_NAME, TOKEN)
    print("Upload time: {} seconds".format(time() - start_time))
              
df = data.get_text(engine, TABLE_NAME, TOKEN)
df_split = split_text(df)
print("Tokens processed: {}".format(len(df)))
upload_result(df_split)
sql.complete_processing(engine, TABLE_NAME, "tokens")
if metadata["embeddings"]:
    compute_embeddings(df, metadata, TABLE_NAME, TOKEN)
    sql.complete_processing(engine, TABLE_NAME, "embeddings")
final_time = (time() - start_time) / 60
print("Total time: {} minutes".format(final_time))

# Get user data for email
user = sql.get_user(engine, meta, metadata["email"])
params = {
    "title": metadata["title"],
    "time": round(final_time, 3)
}

send_email("processing_complete", params, "Processing Complete", user["email"])
print("Email sent to", user["email"])