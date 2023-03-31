import util.dhmeasures as dhmeasures
import pandas as pd
import sys
import json

# Get input files from command line arguments
data_file = sys.argv[1]
params_file = sys.argv[2]

# Parse input files
data = pd.read_csv(data_file)
with open(params_file, "r") as file:
    params = json.load(file)

# Call function based on given metric
if params["metric"] == "ll":
    output = dhmeasures.LogLikelihood(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "jsd":
    output = dhmeasures.JSD(data, params["group_list"], params["word_list"], "group", "word", "n")
elif params["metric"] == "ojsd":
    output = dhmeasures.OriginalJSD(data, params["group_list"], params["word_list"], "group", "word", "n")
else:
    sys.exit("Invalid metric: " + params["metric"])

output_file = data_file.replace("/input/", "/output/")
print(output_file)
output.to_csv(output_file, index = False)
