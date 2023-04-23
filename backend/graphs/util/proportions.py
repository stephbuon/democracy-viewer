# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects.vectors import StrVector
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP

pandas2ri.activate()

def proportions(data, group_list, word_list, group, word, n):
    # Import proportions function from proportions.R
    with open("graphs/util/proportions.R", "r") as file:
        proportions = file.read()
    proportions = STAP(proportions, "proportions")

    # Run proportions function
    if len(group_list) > 0:
        # If groups defined
        output = proportions.proportions(data, StrVector(group_list), StrVector(word_list), group, word, n)
    else:
        # If groups not defined
        output = proportions.proportions_all_groups(data, StrVector(word_list), word, n)
    output = conversion.rpy2py(output)
    
    return output

