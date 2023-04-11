# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects.vectors import StrVector
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP

pandas2ri.activate()

def tf_idf(data, group_list, word_list, group, word, n):
    # Import tf_idf function from tf_idf.R
    with open("tf_idf.R", "r") as file:
        tf_idf = file.read()
    tf_idf = STAP(tf_idf, "tf_idf")

    # Run tf_idf runction
    output = tf_idf.tf_idf(data, StrVector(group_list), StrVector(word_list), group, word, n)
    output = conversion.rpy2py(output)
    return output

