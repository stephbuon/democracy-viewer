import polars as pl
# Database interaction
import util.data_queries as data

def counts(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    # Create custom groups filter if not defined
    if column != None and column != "" and len(values) == 0:
        values = data.get_column_values(table_name, column, 10, token)
        
    # Generate query for metric calculations
    query = data.metric_word_counts(table_name, column, values, word_list, pos_list, topn)
    # Run query
    df = data.run_query(query, token)
    
    # Rename columns based on if there is a grouping variable or not
    if column != None and column != "":
        df = df.rename({ "group": "x", "count": "y", "word": "group", "word_rank": "set" })
    else:
        df = (
            df
                .drop(["group"])
                .rename({ "count": "y", "word": "group", "word_rank": "set" })
                .with_columns(x = pl.lit(""))
        )
    
    return df.collect()

def proportions(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    # Create custom groups filter if not defined
    if column != None and column != "" and len(values) == 0:
        values = data.get_column_values(table_name, column, 10, token)
    
    # Generate query for metric calculations
    query = data.metric_proportions(table_name, column, values, word_list, pos_list, topn)
    # Run query
    df = data.run_query(query, token)

    # Rename columns
    if column != None and column != "":
        df = df.rename({ "group": "x", "proportion": "y", "word": "group", "word_rank": "set" })
    else:
        df = (
            df
                .drop(["group"])
                .rename({ "proportion": "y", "word": "group", "word_rank": "set" })
                .with_columns(x = pl.lit(""))
        )
    
    return df.collect()

def log_likelihood(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Generate query for metric calculations
    query = data.metric_log_likelihood(table_name, column, values, word_list, pos_list)
    # Run query
    df = data.run_query(query, token)
    
    # Reconfigure output and rename columns
    df = df.collect() \
        .pivot(
            "group",
            index = "word",
            values = "ll"
        ) \
        .rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" }) \
        .fill_null(0) \
        .sort(pl.col("word"))
    
    return df

def tf_idf(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], scatter = True, token: str | None = None) -> pl.DataFrame:
    # Generate query for metric calculations
    query = data.metric_tf_idf_scatter(table_name, column, values, word_list, pos_list)
    # Run query
    df = data.run_query(query, token)
    
    # Rearrange data
    df = df.collect() \
        .pivot(
            on = "group",
            index = "word",
            values = "tf_idf"
        ) \
        .rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" }) \
        .fill_null(0) \
        .sort(pl.col("word"))
        
    return df
    

def tf_idf_bar(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    # Create custom groups filter if not defined
    if column != None and column != "" and len(values) == 0:
        values = data.get_column_values(table_name, column, 10, token)
    
    # Generate query for metric calculations
    query = data.metric_tf_idf_bar(table_name, column, values, word_list, pos_list)
    # Run query
    df = data.run_query(query, token)
    
    # Collect data and rename columns
    df = df.collect() \
        .rename({
            "group": "x",
            "tf_idf": "y",
            "word": "group",
            "word_rank": "set"
        })
    
    return df

def jsd(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Create custom groups filter if not defined
    if column != None and column != "" and len(values) == 0:
        values = data.get_column_values(table_name, column, 10, token)
        
    # Generate query for metric calculations
    query = data.metric_jsd(table_name, column, values, word_list, pos_list)
    # Run query
    df = data.run_query(query, token)
    
    # Reconfigure output and rename columns
    df = df.collect() \
        .rename({
            "group1": "x",
            "group2": "y",
            "jsd": "fill"
        })
    
    return df
    
def network_analysis(table_name: str, to_col: str, from_col: str, token: str) -> pl.DataFrame:
    df = data.collect_networks(table_name, to_col, from_col, token)
    
    return df.collect()
