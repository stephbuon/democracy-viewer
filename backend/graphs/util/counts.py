# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP

pandas2ri.activate()

def counts(data, word_list, word):
    # Filter for words in word_list
    output = data[data[word] in word_list]
    
    return output

