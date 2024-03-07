from sqlalchemy import Engine, MetaData
from util.sql_queries import basic_selection

def counts(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    data = basic_selection(engine, meta, table_name, column, values, word_list)
    
    # Goup by word and group (if defined)
    group_cols = [ "word" ]
    if column != None:
        group_cols.append(column)
    # Store ids as list
    ids = data.groupby(group_cols)["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Sum counts
    output = data.groupby(group_cols).sum().reset_index()
    # Add ids
    output["ids"] = ids["ids"]
    
    return output

