import numpy as np
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

def kld(probs: pl.LazyFrame, m: pl.LazyFrame):
    return (probs * (probs / m))

def jsd(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Create custom groups filter if not defined
    if column != None and column != "" and len(values) == 0:
        values = data.get_column_values(table_name, column, 10, token)
    
    # Get raw token data
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token).collect()
    
    # Get distinct groups
    groups = (
        df
            .get_column("group")
            .unique()
            .to_list()
    )
    # Get word and group counts
    df = (
        df
            .with_columns(
                prob = pl.col("count") / pl.col("count").sum().over("group")
            )
    )
    # Calculate probabilities
    df = (
        df
            .pivot(
                on = "group",
                index = "word",
                values = "prob"
            )
            .fill_null(0)
    )
    
    # Compare all pairs of groups
    output = []
    for i in range(len(groups)):
        for j in range(i+1, len(groups)):
            group1 = str(groups[i])
            group2 = str(groups[j])
            # Subset data by current groups
            probs = df.select(["word", group1, group2])
            
            probs = (
                probs
                    .with_columns(
                        # Compute average distribution
                        mean = pl.mean_horizontal(pl.all())
                    )
                    .with_columns(
                        # Compute KLD for each group
                        kld_1 = pl.col(group1) * (pl.col(group1) / pl.col("mean")).log(),
                        kld_2 = pl.col(group2) * (pl.col(group2) / pl.col("mean")).log()
                    )
                    .fill_nan(0)
                    .with_columns(
                        # Compute mean KLD
                        kld = pl.sum_horizontal(["kld_1", "kld_2"])
                    )
            )
            # Compute JSD
            jsd_score = 0.5 * (
                probs
                    .get_column("kld")
                    .sum()
            )
            # Add result to df
            output.append(
                pl.DataFrame({
                    "group1": [group1],
                    "group2": [group2],
                    "jsd": [jsd_score]
                })
            )
              
    # Concatenate results
    if len(output) > 0:
        output_df: pl.DataFrame = pl.concat(output)
        # Rename columns
        output_df = output_df.rename({ "group1": "x", "group2": "y", "jsd": "fill" })
        return output_df
    else:
        return pl.DataFrame()
    