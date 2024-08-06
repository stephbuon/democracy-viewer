import numpy as np
import polars as pl
# Database interaction
import util.data_queries as data
import util.s3 as s3

def counts(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    # Goup by word and group (if defined)
    group_cols = [ "word" ]
    if column != None and column != "":
        group_cols.append("group")
    df = df.drop("record_id")
    # Sum counts
    output = df.group_by(group_cols).sum()
    # Rename columns
    output = output.rename({ "word": "x", "count": "y" })
    # Sort by normalized sum of y and take topn if word_list not provided
    if "group" in output.columns:
        output = output.with_columns(
            y_norm = (pl.col("y") - pl.col("y").mean().over("group")) / pl.col("y").std().over("group")
        )
    else:
        output = output.with_columns(
            y_norm = (pl.col("y") - pl.col("y").mean()) / pl.col("y").std()
        )
    top_words = (
        output
            # Group by "x" and sum "y_norm"
            .group_by("x")
            .agg(pl.col("y_norm").sum().alias("y_norm"))
            # Sort by sum in descending order
            .sort("y_norm", descending=True)
            # Extract top words
            .collect()
            .get_column("x")
            .to_list()
    )
    if len(word_list) == 0:
        top_words = top_words[0:int(topn)]
        output = output.filter(pl.col("x").is_in(top_words))
    output = (
        output
            # Drop the "y_norm" column
            .drop("y_norm")
            # Cast "x" to categorical with specific categories and order
            .with_columns(
                pl.col("x").cast(pl.Categorical, ordering=top_words)
            )
            # Sort by "x" based on the categorical order
            .sort("x")
    )
    
    return output.collect()

def proportions(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    cols = ["word"]
    if column is not None and column != "":
        cols.append("group")
    df = df.drop("record_id")
    # Get word and group counts
    output = df.group_by(cols).sum()
    # Get group total counts
    if "group" in cols:
        output = output.with_columns(
            total = (
                output
                    .group_by("group")
                    .agg(pl.col("count").sum().alias("total"))
                    
            )
        )
    else:
        output = output.with_columns(
            total = pl.col("count").sum()
        )
    # Filter for word list
    if len(word_list) > 0:
        output = output.filter(pl.col("word").is_in(word_list))
    
    output = (
        output
            .with_columns(
                proportion = pl.col("count") / pl.col("total")
            )
            # Drop redundant columns
            .drop(["count", "total"])
            # Rename columns
            .rename({ "word": "x", "proportion": "y" })
    )
    # Sort by normalized sum of y and take topn if word_list not provided
    if "group" in output.columns:
        output = output.with_columns(
            y_norm = (pl.col("y") - pl.col("y").mean().over("group")) / pl.col("y").std().over("group")
        )
    else:
        output = output.with_columns(
            y_norm = (pl.col("y") - pl.col("y").mean()) / pl.col("y").std()
        )  
    top_words = (
        output
            # Group by "x" and sum "y_norm"
            .group_by("x")
            .agg(pl.col("y_norm").sum().alias("y_norm"))
            # Sort by sum in descending order
            .sort("y_norm", descending=True)
            # Extract top words
            .collect()
            .get_column("x")
            .to_list()
    )
    if len(word_list) == 0:
        top_words = top_words[0:int(topn)]
        output = output.filter(pl.col("x").is_in(top_words))
    output = (
        output
            # Drop the "y_norm" column
            .drop("y_norm")
            # Cast "x" to categorical with specific categories and order
            .with_columns(
                pl.col("x").cast(pl.Categorical, ordering=top_words)
            )
            # Sort by "x" based on the categorical order
            .sort("x")
    )
    
    return output.collect()

def tf_idf(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Get total group count
    total_groups = len(values)
    if total_groups == 0:
        total_groups = data.total_word_count(table_name, token)
    # Get group count for each word
    group_counts = data.group_count_by_words(table_name, word_list, column, values, token)
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    # Compute smoothed idf
    idf = {}
    for word in word_list:
        if group_counts.get(word, 0) > 0:
            idf[word] = np.log2(1 + (total_groups / group_counts.get(word)))
        else:
            idf[word] = 0
    # Group by word and group
    group_cols = [ "word", "group" ]
    df = df.drop("record_id")
    # Log normalize grouped counts
    output = (
        df
            .group_by(group_cols)
            .agg(count = pl.col("count").sum())
            .with_columns(
                count = 1 + pl.col("count").log(2)
            )
    )
    # Join with idf
    idf_lst = []
    for _, row in output.iterrows():
        idf_lst.append(idf[row["word"]])
    output["idf"] = idf_lst
    # Compute tf-idf
    output["tf_idf"] = output["count"] * output["idf"]
    # Drop unneeded columns
    output.drop(["count", "idf"], axis = 1, inplace = True)
    # Rearrange columns
    output = output.pivot(index = "word", columns = "group", values = "tf_idf").reset_index().fillna(0)
    try:
        # Rename columns
        output.rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" }, axis = 1, inplace = True)
    except:
        pass
    
    return output

def tf_idf_bar(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    bar = []
    # Compute TF-IDF in scatter plot format
    scatter = tf_idf(table_name, column, values, word_list, pos_list, token)
    # Translate scatter plot format into bar plot format
    for _, record in scatter.iterrows():
        for col in scatter.columns:
            if col != "word":
                if col == "x":
                    x = values[0]
                elif col == "y":
                    x = values[1]
                else:
                    x = col
                bar.append(
                    DataFrame({
                        "x": [x],
                        "y": [record[col]],
                        "group": [record["word"]]
                    })
                )
    output = concat(bar)
    
    # Keep topn words for each group
    if len(word_list) == 0:
        output = (
            output
                .sort_values("y", ascending = False)
                .groupby("x")
                .head(n=int(topn))
        )
    output["set"] = (
        output.groupby("x")["y"]
            .rank(method = "first", ascending = False)
    )
    
    return output

def jsd(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    df.drop("record_id", axis = 1, inplace = True)
    # Get distinct groups
    groups = df["group"].unique()
    # Get word and group counts
    df = df.groupby(["word", "group"]).sum()
    # Calculate probabilities
    df["prob"] = df.groupby(["group"])["count"].transform(lambda x: x / x.sum())
    df = df.drop("count", axis = 1).unstack("group").fillna(0).reset_index()
    df.columns = df.columns.get_level_values(1)
    df.drop("", axis = 1, inplace = True)
    
    # Compare all pairs of groups
    output = []
    for i in range(len(groups)):
        for j in range(i+1, len(groups)):
            # Subset data by current groups
            probs: DataFrame = df[df.columns.intersection([ groups[i], groups[j] ])].copy()
            # Compute average distribution
            m = sum(probs, axis = 1) / probs.shape[1]
            # Compute KLD for each group
            kld = sum(probs * log(probs.div(m, axis = 0)), axis = 1)
            # Compute JSD
            jsd_score = 0.5 * kld.sum()
            # Add result to output
            output.append(
                DataFrame({
                    "group1": [groups[i]],
                    "group2": [groups[j]],
                    "jsd": [jsd_score]
                })
            )
              
    # Concatenate results
    if len(output) > 0:
        output = concat(output)
        # Rename columns
        output.rename({ "group1": "x", "group2": "y", "jsd": "fill" }, axis = 1, inplace = True)
        return output
    else:
        return DataFrame()
    
def log_likelihood(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Get the total number of words in the corpus
    total_corpus_words = data.total_word_count(table_name, token)
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    # Get unique words and groups
    words = df["word"].unique()
    groups = df["group"].unique()
    # Goup by word and group (if defined)
    group_cols = [ "word", "group" ]
    df.drop("record_id", axis = 1, inplace = True)
    # Sum counts
    df = df.groupby(group_cols).sum().unstack("group").fillna(0)
    df.columns = df.columns.get_level_values(1)
    output = []
    for word in words:
        # Initialize df for word
        df2 = DataFrame({
            "word": [word]
        })
        for group in groups:
            # Compute LL terms
            a = df.loc[word, group]
            b = df.loc[word,:].sum() - a
            c = df.loc[:,group].sum() - a
            d = total_corpus_words - a - b - c
            e1 = (a + c) * (a + b) / total_corpus_words
            e2 = (b + d) * (a + b) / total_corpus_words
            if a > 0:
                ll = 2 * (a * log(a / e1))
            else:
                ll = 0
            if b > 0:
                ll += 2 * b * log(b / e2)
            # Add ll for group to df
            df2[group] = ll
        output.append(df2)
    
    if len(output) > 0:
        output = concat(output)
        # Rename columns
        output.rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" }, axis = 1, inplace = True)
        return output
    else:
        return DataFrame()