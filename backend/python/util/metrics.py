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

    # # Sum counts and rename columns
    df = df.group_by(group_cols).sum()
    
    if "group" in group_cols:
        df = df.rename({ "group": "x", "count": "y", "word": "group" })
    else:
        df = (
            df
                .rename({ "count": "y", "word": "group" })
                .with_columns(x = pl.lit(""))
        )
    
    # # Keep topn words for each group
    if len(word_list) == 0:
        df = (
            df
                .sort("y", descending = True)
                .group_by("x")
                .head(n=int(topn))
        )
    else:
        df = df.sort("y", descending = True)
        
    # Rank words in each group
    df = df.collect()
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
            .select(["x", "group", "set"])
    )
    df = df.join(df2, on = ["x", "group"]).select(["x", "y", "group", "set"])
    
    return df

def proportions(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5, token: str | None = None) -> pl.DataFrame:
    df = data.basic_selection(table_name, column, values, [], pos_list, token)
    
    group_cols = ["word"]
    if column is not None and column != "":
        group_cols.append("group")

    # Get word and group counts
    df = df.group_by(group_cols).sum()
    # Get group total counts
    if "group" in group_cols:
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
    
    # Compute proportions
    df = (
        df
            .with_columns(
                proportion = pl.col("count") / pl.col("total")
            )
            # Drop redundant columns
            .drop(["count", "total"])
    )
    
    if "group" in group_cols:
        df = df.rename({ "group": "x", "proportion": "y", "word": "group" })
    else:
        df = (
            df
                .rename({ "proportion": "y", "word": "group" })
                .with_columns(x = pl.lit(""))
        )
    
    if len(word_list) == 0:
        # Keep topn words for each group
        df = (
            df
                .sort("y", descending = True)
                .group_by("x")
                .head(n=int(topn))
        )
    else:
        # Filter by word list
        df = df.filter(pl.col("group").is_in(word_list)).sort("y", descending = True)
        
    # Rank words in each group
    df = df.collect()
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
            .select(["x", "group", "set"])
    )
    df = df.join(df2, on = ["x", "group"]).select(["x", "y", "group", "set"])
    
    return df

def log_likelihood(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Get the total number of words in the corpus
    total_corpus_words = data.total_word_count(table_name, token)
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token).collect()
    # Get unique words and groups
    words = df.get_column("word").unique().to_list()
    groups = df.get_column("group").unique().to_list()
    # Get counts of words and groups
    word_counts = data.word_counts(table_name, word_list, pos_list, token)
    group_counts = data.group_counts(table_name, column, values, token)
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
            # Count of word in group
            a = (
                df
                    .filter(
                        (pl.col("word") == word) & 
                        (pl.col("group") == group)
                    )
                    .get_column("count")
                    .sum()
            )
            # Count of word not in group
            b = word_counts[word] - a
            # Count of group not word
            c = group_counts[group] - a
            # Count not group not word
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
                pl.lit(np.log(ll)).alias(group)
            )
        output.append(df2)
    
    if len(output) > 0:
        output_df: pl.DataFrame = pl.concat(output)
        # Rename columns
        output_df = output_df.rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" })
        
        return output_df
    else:
        return pl.DataFrame()
    
def tf_idf(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
    # Get total group count
    total_groups = len(values)
    if total_groups == 0:
        total_groups = data.group_count(table_name, column, token)
    # Get group count for each word
    group_counts = data.group_count_by_words(table_name, word_list, column, values, token)
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list, pos_list, token)
    
    # Compute smoothed idf
    idf = {}
    for word in group_counts.keys():
        if group_counts.get(word, 0) > 0:
            idf[word] = np.log2(total_groups / group_counts.get(word))
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
    print(df)
    
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
    print(df)
    try:
        # Rename columns
        df = df.rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" })
    except:
        pass
    
    return df

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
                .sort("y", descending = True)
                .group_by("x")
                .head(n=int(topn))
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
            .select(["x", "group", "set"])
    )
    df = df.join(df2, on = ["x", "group"])
    
    return df

def kld(probs: pl.LazyFrame, m: pl.LazyFrame):
    return (probs * (probs / m))

def jsd(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.DataFrame:
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
            .group_by(["word", "group"])
            .agg(count = pl.col("count").sum())
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
            group1 = groups[i]
            group2 = groups[j]
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
    