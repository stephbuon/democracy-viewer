from time import time
start_time = time()
total_start_time = time()
import datetime as dt
import humanize
# Import metrics
import util.metrics as metrics
import util.embeddings_load as embed
# Other imports
import json
import sys
# Import sql helpers
from util.sql_connect import sql_connect
import util.sql_queries as sql
# Word processing
import util.word_processing as wp
print("Import time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))

# Get input file from command line argument
params_file = sys.argv[1]

# Get distributed token if defined
try:
    TOKEN = sys.argv[2]
except:
    TOKEN = None

engine, meta = sql_connect()

start_time = time()
# Parse input files
with open(params_file, "r") as file:
    params: dict = json.load(file)
    
# Get metadata to determine preprocessing type
metadata = sql.get_metadata(engine, meta, params["table_name"])

# If group_list or word_list are not in params, set to empty list
# Also remove Nones from lists
if "group_list" not in params.keys():
    params["group_list"] = []
if "word_list" not in params.keys():
    params["word_list"] = []
    
# Lemmatize or stem words in word_list
if params["metric"] not in ["embed"]:
    if metadata["preprocessing_type"] == "stem":
        params["word_list"] = list(map(lambda x: wp.stem(x, metadata["language"])[0], params["word_list"]))
    elif metadata["preprocessing_type"] == "lemma":
        params["word_list"] = list(map(lambda x: wp.lemmatize(x, metadata["language"])[0], params["word_list"]))
print("Parameter processing time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))

# Call function based on given metric
start_time = time()
if params["metric"] == "counts":
    output = metrics.counts(params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []), params.get("pos_list", []), params.get("topn", 5), TOKEN)
elif params["metric"] == "proportions":
    output = metrics.proportions(params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []), params.get("pos_list", []), params.get("topn", 5), TOKEN)
elif params["metric"] == "tf-idf-scatter":
    output = metrics.tf_idf(params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []), params.get("pos_list", []), True, TOKEN)
elif params["metric"] == "tf-idf-bar":
    output = metrics.tf_idf_bar(params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []), params.get("pos_list", []), params.get("topn", 5), TOKEN)
elif params["metric"] == "ll":
    output = metrics.log_likelihood(params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []), params.get("pos_list", []), TOKEN)
elif params["metric"] == "jsd":
    output = metrics.jsd(params["table_name"], params.get("group_name", None), params.get("group_list", []), params.get("word_list", []), params.get("pos_list", []), TOKEN)
elif params["metric"] == "embeddings-similar":
    output = embed.get_similar_words(params["table_name"], params["word_list"][0], params.get("group_name", None), params.get("group_list", []), params.get("topn", 5), TOKEN)
elif params["metric"] == "embeddings-different":
    output = embed.get_words_similarity_grouped(params["table_name"], params["word_list"][0], params["word_list"][1], params.get("group_name", None), params.get("group_list", []), TOKEN)
elif params["metric"] == "embeddings-raw":
    output = embed.get_word_vectors(params["table_name"], params["word_list"], params.get("group_name", None), params.get("group_list", []), TOKEN)
else:
    exit("Invalid metric: " + params["metric"])
print("Computation time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - start_time))))

output_file = params_file.replace("/input/", "/output/")
if type(output) == dict or type(output) == list:
    json.dump(output, open(output_file, "w"), indent = 4)
else:
    output.to_pandas(use_pyarrow_extension_array=True).to_json(output_file, orient = "records", indent = 4)

print("Total time: {}".format(humanize.precisedelta(dt.timedelta(seconds = time() - total_start_time))))