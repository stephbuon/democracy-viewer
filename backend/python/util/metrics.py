import numpy as np
import polars as pl
# Database interaction
import util.data_queries as data

def counts(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    # Goup by word and group (if defined)
    group_cols = [ "word" ]
    if column != None and column != "":
        group_cols.append("group")
    # df = df.drop("record_id")
    # Sum counts
    df = df.group_by(group_cols).sum()
    # Sort by normalized sum of y and take topn if word_list not provided
    if "group" in df.collect_schema().names():
        df = df.with_columns(
            y_norm = (pl.col("count") - pl.col("count").mean().over("group")) / pl.col("count").std().over("group")
        )
    else:
        df = df.with_columns(
            y_norm = (pl.col("count") - pl.col("count").mean()) / pl.col("count").std()
        )
        
    df = df.collect().rename({ "word": "x", "count": "y" })
    top_words = (
        df
            # Group by "x" and sum "y_norm"
            .group_by("x")
            .agg(y_norm = pl.col("y_norm").sum())
            # Sort by sum in descending order
            .sort("y_norm", descending=True)
            # Extract top words
            .get_column("x")
            .to_list()
    )
    if len(word_list) == 0:
        top_words = top_words[0:int(topn)]
        df = df.filter(pl.col("x").is_in(top_words))
    df = (
        df
            # Cast "x" to categorical with specific categories and order
            .with_columns(
                x = pl.col("x").cast(pl.Enum(top_words))
            )
            # Sort by "x" based on the categorical order
            .sort("x")
    )
    if "group" in group_cols:
        df = df.select(["x", "y", "group"])
    else:
        df = df.select(["x", "y"])
    
    return df

def proportions(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    cols = ["word"]
    if column is not None and column != "":
        cols.append("group")
    # df = df.drop("record_id")
    # Get word and group counts
    df = df.group_by(cols).sum()
    # Get group total counts
    if "group" in cols:
        df2 = (
            df
                .clone()
                .group_by("group")
                .agg(total = pl.col("count").sum())
        )
        df = df.join(df2, on = "group")
    else:
        df = df.with_columns(
            total = pl.col("count").sum()
        )
    # Filter for word list
    if len(word_list) > 0:
        df = df.filter(pl.col("word").is_in(word_list))
    
    df = (
        df
            .with_columns(
                proportion = pl.col("count") / pl.col("total")
            )
            # Drop redundant columns
            .drop(["count", "total"])
            # Rename columns
            .rename({ "word": "x", "proportion": "y" })
    )
    # Sort by normalized sum of y and take topn if word_list not provided
    if "group" in df.collect_schema().names():
        df = df.with_columns(
            y_norm = (pl.col("y") - pl.col("y").mean().over("group")) / pl.col("y").std().over("group")
        )
    else:
        df = df.with_columns(
            y_norm = (pl.col("y") - pl.col("y").mean()) / pl.col("y").std()
        )  
        
    df = df.collect()
    top_words = (
        df
            # Group by "x" and sum "y_norm"
            .group_by("x")
            .agg(pl.col("y_norm").sum().alias("y_norm"))
            # Sort by sum in descending order
            .sort("y_norm", descending=True)
            # Extract top words
            .get_column("x")
            .to_list()
    )
    if len(word_list) == 0:
        top_words = top_words[0:int(topn)]
        df = df.filter(pl.col("x").is_in(top_words))
    df = (
        df
            # Cast "x" to categorical with specific categories and order
            .with_columns(
                x = pl.col("x").cast(pl.Enum(top_words))
            )
            # Sort by "x" based on the categorical order
            .sort("x")
    )
    
    if "group" in cols:
        df = df.select(["x", "y", "group"])
    else:
        df = df.select(["x", "y"])
    
    return df

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
    for word in group_counts.keys():
        if group_counts.get(word, 0) > 0:
            idf[word] = np.log2(1 + (total_groups / group_counts.get(word)))
        else:
            idf[word] = 0
    idf_df = pl.DataFrame({
        "word": idf.keys(),
        "idf": idf.values()
    })
    
    group_cols = [ "word", "group" ]
    df = (
        df
            # Group by word and group
            .drop("record_id")
            .group_by(group_cols)
            .agg(count = pl.col("count").sum())
            # Join with IDF
            .join(idf_df.lazy(), on = "word")
            .with_columns(
                # Log normalize grouped counts
                count = 1 + pl.col("count").log(2)
            )
            .with_columns(
                # Compute tf-idf
                tf_idf = pl.col("count") * pl.col("idf")
            )
    )
    
    df = (
        df
            .collect()
            .pivot(
                on = "group",
                index = "word",
                values = "tf_idf"
            )
            .fill_null(0)
    )
    try:
        # Rename columns
        df = df.rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" })
    except:
        pass
    
    return df

def log_likelihood(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Get the total number of words in the corpus
    total_corpus_words = data.total_word_count(table_name, token)
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token).collect()
    # Get unique words and groups
    words = df.get_column("word").unique().to_list()
    groups = df.get_column("group").unique().to_list()
    # Goup by word and group (if defined)
    group_cols = [ "word", "group" ]
    # Sum counts
    df = df.group_by(group_cols).sum()
    output = []
    for word in words:
        # Initialize df for word
        df2 = pl.DataFrame({
            "word": [word]
        })
        for group in groups:
            # Compute LL terms
            a = (
                df
                    .filter(
                        (pl.col("word") == word) & 
                        (pl.col("group") == group)
                    )
                    .get_column("count")
                    .sum()
            )
            # b = df.loc[word,:].sum() - a
            b = (
                df
                    .filter(pl.col("word") == word)
                    .get_column("count")
                    .sum()
            ) - a
            # c = df.loc[:,group].sum() - a
            c = (
                df
                    .filter(pl.col("group") == group)
                    .get_column("count")
                    .sum()
            ) - a
            d = total_corpus_words - a - b - c
            e1 = (a + c) * (a + b) / total_corpus_words
            e2 = (b + d) * (a + b) / total_corpus_words
            if a > 0:
                ll = 2 * (a * np.log(a / e1))
            else:
                ll = 0
            if b > 0:
                ll += 2 * b * np.log(b / e2)
            # Add ll for group to df
            df2 = df2.with_columns(
                pl.lit(ll).alias(group)
            )
        output.append(df2)
    
    if len(output) > 0:
        output_df: pl.DataFrame = pl.concat(output)
        # Rename columns
        output_df = output_df.rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" })
        
        return output_df
    else:
        return pl.DataFrame()

def tf_idf_bar(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    bar = []
    # Compute TF-IDF in scatter plot format
    scatter = tf_idf(table_name, column, values, word_list, pos_list, token)
    # Translate scatter plot format into bar plot format
    for row in scatter.iter_rows(named = True):
        for col in scatter.columns:
            if col != "word":
                if col == "x":
                    x = values[0]
                elif col == "y":
                    x = values[1]
                else:
                    x = col
                bar.append(
                    pl.DataFrame({
                        "x": [x],
                        "y": [row[col]],
                        "group": [row["word"]]
                    })
                )
    df: pl.DataFrame = pl.concat(bar)
    
    # Keep topn words for each group
    if len(word_list) == 0:
        df: pl.DataFrame = (
            df
                .lazy()
                .sort("y", descending = True)
                .group_by("x")
                .head(n=int(topn))
                .collect()
        )
        
    # Rank words in each group
    df2 = (
        df
            .clone()
            .with_columns(
                set = (
                    pl.col("y")
                        .rank(method = "ordinal", descending = True)
                        .over("x")
                )
            )
            .select(["x", "set"])
    )
    df = df.join(df2, on = "x")
    
    return df

def kld(probs: pl.LazyFrame, m: pl.LazyFrame):
    return (probs * (probs / m))

def jsd(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    df = df.drop("record_id").collect()
    # Get distinct groups
    groups = (
        df
            .unique("group")
            .get_column("group")
            .to_list()
    )
    # Get word and group counts
    df = (
        df
            .group_by(["word", "group"])
            .sum()
    )
    # Calculate probabilities
    df = (
        df
            .with_columns(
                prob = pl.col("count") / pl.col("count").sum().over("group")
            )
            .drop("count")
            .pivot(
                on = "group",
                values = "prob"
            )
            .fill_null(0)
    )
    
    # Compare all pairs of groups
    output = []
    for i in range(len(groups)):
        for j in range(i+1, len(groups)):
            group1 = groups[i]
            group2 = groups[j]
            # Subset data by current groups
            probs = df.select([group1, group2])
            
            probs = probs.with_columns(
                # Compute average distribution
                mean = pl.mean_horizontal(pl.all()),
                # Compute KLD for each group
                kld_1 = pl.col(group1) * (pl.col(group1) / pl.col("mean")).log(),
                kld_2 = pl.col(group2) * (pl.col(group2) / pl.col("mean")).log(),
                kld = pl.mean_horizontal(["kld_1", "kld_2"])
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
    