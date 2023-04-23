# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP

pandas2ri.activate()

def raw(data, word_list, word):
    # Import raw function from raw.R
    with open("graphs/util/raw.R", "r") as file:
        raw = file.read()
    raw = STAP(raw, "raw")

    # Run raw function
    output = raw.raw(data, word_list, word)
    output = conversion.rpy2py(output)
    
    return output

