from time import time
start_time = time()
total_start_time = time()
# Import metrics
import util.metrics as metrics
from util.embeddings_load import get_similar_words
# Other imports
from json import load, dump
from sys import argv
# Database Interaction
from sqlalchemy import create_engine, MetaData, select
# Import sql helpers
from util.sql_connect import sql_connect
from util.sqlalchemy_tables import DatasetMetadata
from util.sql_queries import get_metadata
# Word processing
from util.word_processing import lemmatize, stem
print("Import time: {} seconds".format(time() - start_time))

# Get input file from command line argument
params_file = argv[1]

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
print("Connection time: {} seconds".format(time() - start_time))

start_time = time()
# Parse input files
with open(params_file, "r") as file:
    params = load(file)
    
# Get metadata to determine preprocessing type
metadata = get_metadata(engine, meta, params["table_name"])

# If group_list or word_list are not in params, set to empty list
# Also remove Nones from lists
if "group_list" not in params.keys():
    params["group_list"] = []
if "word_list" not in params.keys():
    params["word_list"] = []
    
# Lemmatize or stem words in word_list
if params["metric"] not in ["embed"]:
    if metadata["preprocessing_type"] == "stem":
        params["word_list"] = list(map(lambda x: stem(x, metadata["language"])[0], params["word_list"]))
    elif metadata["preprocessing_type"] == "lemma":
        params["word_list"] = list(map(lambda x: lemmatize(x, metadata["language"])[0], params["word_list"]))
print("Parameter processing time: {} seconds".format(time() - start_time))

# Call function based on given metric
start_time = time()
if params["metric"] == "counts":
    output = metrics.counts(engine, meta, params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []))
elif params["metric"] == "ll":
    output = metrics.log_likelihood(engine, meta, params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []))
elif params["metric"] == "jsd":
    output = metrics.jsd(engine, meta, params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []))
elif params["metric"] == "tf-idf":
    output = metrics.tf_idf(engine, meta, params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []))
elif params["metric"] == "proportion":
    output = metrics.proportions(engine, meta, params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []))
elif params["metric"] == "embed":
    output = get_similar_words(params["table_name"], params["word_list"][0], params.get("group_name", None), params.get("group_list", []))
else:
    exit("Invalid metric: " + params["metric"])
print("Computation time: {} seconds".format(time() - start_time))

output_file = params_file.replace("/input/", "/output/")
if type(output) == dict:
    dump(output, open(output_file, "w"), indent = 4)
else:
    output.to_json(output_file, orient = "records")

print("Total time: {} seconds".format(time() - total_start_time))