import pandas as pd
# These will let us use R packages:
from rpy2.robjects.packages import STAP
from rpy2.robjects import pandas2ri
from rpy2.robjects.vectors import StrVector
from rpy2.robjects import conversion

pandas2ri.activate()
with open("graphs/util/dhmeasures.R", "r") as file:
    dhmeasures = file.read()
dhmeasures = STAP(dhmeasures, "dhmeasures")

def LogLikelihood(data, group_list, word_list, group, word, n):
    output = dhmeasures.LogLikelihood(data, StrVector(group_list), StrVector(word_list), group, word, n)
    output = conversion.rpy2py(output)
    return output

def JSD(data, group_list, word_list, group, word, n):
    # Return an empty data frame if group_list's size is less than 2
    if len(group_list) < 2:
        return pd.DataFrame()
    output = dhmeasures.JSD(data, StrVector(group_list), StrVector(word_list), group, word, n)
    output = conversion.rpy2py(output)
    return output

def OriginalJSD(data, group_list, word_list, group, word, n):
    # Return an empty data frame if group_list's size is less than 2
    if len(group_list) < 2:
        return pd.DataFrame()
    output = dhmeasures.OriginalJSD(data, StrVector(group_list), StrVector(word_list), group, word, n)
    output = conversion.rpy2py(output)
    return output