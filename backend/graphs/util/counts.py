# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP

pandas2ri.activate()

def counts(data, word_list, word):
    # Import counts function from counts.R
    with open("graphs/util/counts.R", "r") as file:
        counts = file.read()
    counts = STAP(counts, "raw")

    # Run counts function
    output = counts.counts(data, word_list, word)
    output = conversion.rpy2py(output)
    
    return output

