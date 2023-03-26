import util.dhmeasures as dhmeasures
import pandas as pd
import sys

input_file = sys.argv[1]
metric = sys.argv[2]

data = pd.read_csv(input_file)

# TEMPORARY
group = "speaker"
word = "word"
n = "n"
group_list = ["Mr. Hume", "Mr. Brougham"]
word_list = ["house", "person"]

if metric == "ll":
    output = dhmeasures.LogLikelihood(data, group_list, word_list, group, word, n)
elif metric == "jsd":
    output = dhmeasures.JSD(data, group_list, word_list, group, word, n)
elif metric == "ojsd":
    output = dhmeasures.OriginalJSD(data, group_list, word_list, group, word, n)
else:
    sys.exit("Invalid metric: " + metric)

output_file = input_file.replace("/input/", "/output/")

output.to_csv(output_file)
