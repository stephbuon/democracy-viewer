# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects.vectors import StrVector
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP

pandas2ri.activate()

def word_embeddings():
    # Import tf_idf function from tf_idf.R
    with open("preprocessing/util/word_embeddings.R", "r") as file:
        word_embeddings = file.read()
    word_embeddings = STAP(word_embeddings, "word_embeddings")

    # Run tf_idf runction
    output = word_embeddings.export_word_embeddings("", view_most_similar = True)
    output = conversion.rpy2py(output)
    
    return output

