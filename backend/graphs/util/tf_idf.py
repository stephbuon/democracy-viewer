import pandas as pd
pd.DataFrame.iteritems = pd.DataFrame.items
# These will let us use R packages:
from rpy2.robjects import pandas2ri
from rpy2.robjects.vectors import StrVector
from rpy2.robjects import conversion
from rpy2.robjects.packages import STAP
# Database interaction
from sqlalchemy import Engine, MetaData
from util.sql_queries import basic_selection

pandas2ri.activate()

def tf_idf(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    # Import tf_idf function from tf_idf.R
    with open("graphs/util/tf_idf.R", "r") as file:
        tf_idf = file.read()
    tf_idf = STAP(tf_idf, "tf_idf")

    data = basic_selection(engine, meta, table_name, column, values, word_list)
    # Run tf_idf runction
    # print(data.head())
    # print(values)
    # print(word_list)
    # output = tf_idf.tf_idf(data, StrVector(values), StrVector(word_list), "group", "word", "n")
    # output = conversion.rpy2py(output)
    
    
    return output

