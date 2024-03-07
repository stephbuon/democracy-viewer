import pandas as pd
import numpy as np
# Database interaction
from sqlalchemy import Engine, MetaData
import util.sql_queries as queries

def counts(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    data = queries.basic_selection(engine, meta, table_name, column, values, word_list)
    
    # Goup by word and group (if defined)
    group_cols = [ "word" ]
    if column != None:
        group_cols.append("group")
    # Store ids as list
    ids = data.groupby(group_cols)["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Sum counts
    output = data.groupby(group_cols).sum().reset_index()
    # Add ids
    output["ids"] = ids["ids"]
    
    return output

def tf_idf(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    # Get group counts for words
    group_counts = queries.group_count_by_words(engine, meta, table_name, word_list, column)
    # Get total group count
    total_groups = queries.group_count(engine, meta, table_name, column)
    # Compute smoothed idf
    idf = {}
    for word in word_list:
        idf[word] = np.log2(1 + (total_groups / group_counts[word]))
        
    # Get records by words and groups
    data = queries.basic_selection(engine, meta, table_name, column, values, word_list)
    # Goup by word and group (if defined)
    group_cols = [ "word" ]
    if column != None:
        group_cols.append("group")
    # Store ids as list
    ids = data.groupby("word")["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Sum counts
    output = data.groupby(group_cols).sum().reset_index()
    # Log normalize counts (tf)
    output["count"] = 1 + np.log2(output["count"])
    # Join with idf
    idf_lst = []
    for i, row in output.iterrows():
        idf_lst.append(idf[row["word"]])
    output["idf"] = idf_lst
    # Compute tf-idf
    output["tf_idf"] = output["count"] / output["idf"]
    # Drop unneeded columns
    output.drop(["count", "idf"], axis = 1, inplace = True)
    # Rearrange columns
    output = output.pivot(index = "word", columns = "group", values = "tf_idf").reset_index().fillna(0)
    # Add ids
    output["ids"] = ids["ids"]
    
    return output

def proportions(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    data = queries.basic_selection(engine, meta, table_name, column, values, word_list)
    
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