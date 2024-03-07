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

def proportions(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    # Import proportions function from proportions.R
    with open("graphs/util/proportions.R", "r") as file:
        proportions = file.read()
    proportions = STAP(proportions, "proportions")

    data = basic_selection(engine, meta, table_name, column, values, word_list)
    # Run proportions function
    if column != None and len(values) > 0:
        # Goup by word and group (if defined)
        # Store ids as list
        ids = data.groupby(["word", "group"])["id"].apply(list).reset_index(name = "ids")
        data.drop("id", axis = 1, inplace = True)
        output = data.groupby(["word", "group"]).sum().reset_index()
        group_counts = output.groupby("group")["count"].sum().reset_index()
        group_counts.rename(columns = { "count": "total" }, inplace = True)
        output = pd.merge(output, group_counts, on = "group")
        output["proportion"] = output["count"] / output["total"]
        output.drop(["count", "total"], axis = 1, inplace = True) 
            
        # Add ids
        output["ids"] = ids["ids"]
    else:
        # If groups not defined
        ids = data.groupby(["word"])["id"].apply(list).reset_index(name = "ids")
        data.drop("id", axis = 1, inplace = True)
        output = data.groupby()
        output["proportion"] = output["count"] / sum(output["count"])
        output.drop("count", axis = 1, inplace = True) 
    # output = conversion.rpy2py(output)
    
    return output

