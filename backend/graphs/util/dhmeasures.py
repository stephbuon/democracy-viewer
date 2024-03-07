import pandas as pd
pd.DataFrame.iteritems = pd.DataFrame.items
# These will let us use R packages:
from rpy2.robjects.packages import STAP
from rpy2.robjects import pandas2ri
from rpy2.robjects.vectors import StrVector
from rpy2.robjects import conversion
# Database interaction
from sqlalchemy import Engine, MetaData
from util.sql_queries import basic_selection

pandas2ri.activate()

def LogLikelihood(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    with open("graphs/util/dhmeasures.R", "r") as file:
        dhmeasures = file.read()
    dhmeasures = STAP(dhmeasures, "dhmeasures")
    
    data = basic_selection(engine, meta, table_name, column, values, word_list)
    output = dhmeasures.LogLikelihood(data, StrVector(values), StrVector(word_list), "group", "word", "n")
    output = conversion.rpy2py(output)
    return output

def JSD(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    # Return an empty data frame if values's size is less than 2
    if len(values) < 2:
        return pd.DataFrame()
    
    with open("graphs/util/dhmeasures.R", "r") as file:
        dhmeasures = file.read()
    dhmeasures = STAP(dhmeasures, "dhmeasures")
    
    data = basic_selection(engine, meta, table_name, column, values, word_list)
    output = dhmeasures.JSD(data, StrVector(values), StrVector(word_list), "group", "word", "n")
    output = conversion.rpy2py(output)
    return output

def OriginalJSD(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    # Return an empty data frame if values's size is less than 2
    if len(values) < 2:
        return pd.DataFrame()
    
    with open("graphs/util/dhmeasures.R", "r") as file:
        dhmeasures = file.read()
    dhmeasures = STAP(dhmeasures, "dhmeasures")
    
    data = basic_selection(engine, meta, table_name, column, values, word_list)
    output = dhmeasures.OriginalJSD(data, StrVector(values), StrVector(word_list), "group", "word", "n")
    output = conversion.rpy2py(output)
    return output