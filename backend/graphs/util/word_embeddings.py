# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP

pandas2ri.activate()

def word_embeddings(data, search_word):
    # Import word_embeddings function from word_embeddings.R
    with open("graphs/util/word_embeddings.R", "r") as file:
        word_embeddings = file.read()
    word_embeddings = STAP(word_embeddings, "word_embeddings")

    # Run tf_idf runction
    output = word_embeddings.word_embeddings(data, search_word)
    output = conversion.rpy2py(output)
    
    return output

