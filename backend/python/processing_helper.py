from time import time
start_time = time()
import json
from sys import argv
import util.word_processing as wp

file_name = argv[1]
process_type = argv[2]
language = argv[3]

if process_type == "stem":
    process_function = lambda x: wp.stem(x, language)
elif process_type == "lemma":
    process_function = lambda x: wp.lemmatize(x, language)
elif process_type == "none":
    print("No preprocessing was done on this dataset")
    exit(0)
else:
    raise Exception("Invalid preprocessing type: {}".format(process_type))

results = []
for i in range(3, len(argv)):
    results.append(process_function(argv[i])[0])
    
with open(file_name, "w") as f:
    json.dump(results, f)
    
print("Total time: {} seconds".format(time() - start_time))