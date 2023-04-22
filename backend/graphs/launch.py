# Import metrics
import util.dhmeasures as dhmeasures
import util.proportions as proportions
import util.raw as raw
import util.tf_idf as tf_idf
import util.word_embeddings as embeddings

# Other imports
import pandas as pd
import sys
import json

# Get input files from command line arguments
data_file = sys.argv[1]
params_file = sys.argv[2]

# Parse input files
with open(params_file, "r") as file:
    params = json.load(file)
data = pd.read_csv(data_file)
# If params metric is not "embeddings", sum all word counts in the same group
if params["metric"] != "embedding":
    if "group" in data.columns:
        data = data.groupby(["group", "word"]).sum().reset_index()
    else:
        data = data.groupby("word").sum().reset_index()

# If group_list or word_list are not in params, set to empty list
# Also remove Nones from lists
if "group_list" not in params.keys():
    params["group_list"] = []
if "word_list" not in params.keys():
    params["word_list"] = []

# Call function based on given metric
if params["metric"] == "ll":
    output = dhmeasures.LogLikelihood(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "jsd":
    output = dhmeasures.JSD(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "ojsd":
    output = dhmeasures.OriginalJSD(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "raw":
    output = raw.raw(data, params["word_list"], "word")
elif params["metric"] == "tf-idf":
    output = tf_idf.tf_idf(data, params["group_list"], params["word_list"], "group", "word", "n") 
elif params["metric"] == "embedding":
    output = embeddings.word_embeddings(data, params["word_list"])
elif params["metric"] == "proportion":
    output = proportions.proportions(data, params["group_list"], params["word_list"], "group", "word", "n")
else:
    sys.exit("Invalid metric: " + params["metric"])

output_file = data_file.replace("/input/", "/output/")
output.to_csv(output_file, index = False)
