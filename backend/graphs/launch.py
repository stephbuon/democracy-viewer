# Import metrics
import util.dhmeasures as dhmeasures
import util.proportions as proportions
import util.counts as counts
import util.tf_idf as tf_idf

# Other imports
import pandas as pd
import sys
import json
from nltk.corpus import wordnet as wn

# Get input files from command line arguments
data_file = sys.argv[1]
params_file = sys.argv[2]

# Parse input files
with open(params_file, "r") as file:
    params = json.load(file)
data = pd.read_csv(data_file)

# If group_list or word_list are not in params, set to empty list
# Also remove Nones from lists
if "group_list" not in params.keys():
    params["group_list"] = []
if "word_list" not in params.keys():
    params["word_list"] = []
    
# Lemmatize words in word_list
params["word_list"] = list(map(wn.morphy, params["word_list"]))

ids = []
if len(params["group_list"]) > 0:
    for group in params["group_list"]:
        if len(params["word_list"]) > 0:
            for word in params["word_list"]:
                ids.append({
                    "group": group,
                    "word": word,
                    "ids": list(data.loc[(data["group"] == group) & (data["word"] == word)]["id"])
                })
        else:
            ids.append({
                "group": group,
                "ids": list(data.loc[(data["group"] == group)]["id"])
            })
elif len(params["word_list"]) > 0:
    for word in params["word_list"]:
        ids.append({
            "word": word,
            "ids": list(data.loc[(data["word"] == word)]["id"])
        })
else:
    ids.append({
        "ids": list(data["id"])
    })
with open(params_file.replace("/input/", "/output/"), "w") as file:
    file.write(json.dumps(ids))
    
cols = ["word"]
if "group" in data.columns:
    cols.append("group")
data = data.groupby(cols)["n"].sum().reset_index()

# Call function based on given metric
if params["metric"] == "counts":
    output = counts.counts(data, params["word_list"], "word")
elif params["metric"] == "ll":
    output = dhmeasures.LogLikelihood(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "jsd":
    output = dhmeasures.JSD(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "ojsd":
    output = dhmeasures.OriginalJSD(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "tf-idf":
    output = tf_idf.tf_idf(data, params["group_list"], params["word_list"], "group", "word", "n") 
elif params["metric"] == "proportion":
    output = proportions.proportions(data, params["group_list"], params["word_list"], "group", "word", "n")
else:
    sys.exit("Invalid metric: " + params["metric"])

output_file = data_file.replace("/input/", "/output/")
output.to_csv(output_file, index = False)
