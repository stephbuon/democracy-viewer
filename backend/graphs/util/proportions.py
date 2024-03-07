import pandas as pd
# Database interaction
from sqlalchemy import Engine, MetaData
from util.sql_queries import basic_selection

def proportions(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    data = basic_selection(engine, meta, table_name, column, values, word_list)
    
    # Store ids as list
    ids = data.groupby(["word", "group"])["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Get word and group counts
    output = data.groupby(["word", "group"]).sum().reset_index()
    # Get group total counts
    group_counts = output.groupby("group")["count"].sum().reset_index()
    group_counts.rename(columns = { "count": "total" }, inplace = True)
    output = pd.merge(output, group_counts, on = "group")
    # Calculate proportion by group
    output["proportion"] = output["count"] / output["total"]
    output.drop(["count", "total"], axis = 1, inplace = True) 
        
    # Add ids
    output["ids"] = ids["ids"]
    
    return output

