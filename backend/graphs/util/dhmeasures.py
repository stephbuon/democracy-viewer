# These will let us use R packages:
from rpy2.robjects.packages import importr
from rpy2.robjects import pandas2ri
pandas2ri.activate()
dhmeasures = importr("dhmeasures")

def LogLikelihood(data, group_list, word_list, group, word, n):
    output = dhmeasures.log_likelihood(data, group_list, word_list, group, word, n)
    return output

def JSD(data, group_list, word_list, group, word, n):
    output = dhmeasures.jsd(data, group_list, word_list, group, word, n)
    return output

def OriginalJSD(data, group_list, word_list, group, word, n):
    output = dhmeasures.original_jsd(data, group_list, word_list, group, word, n)
    return output