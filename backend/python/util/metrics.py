from numpy import log, log2, sum
from pandas import DataFrame, concat, merge
# Database interaction
import util.data_queries as data

def counts(table_name: str, column: str | None, values: list[str], word_list: list[str], token: str | None = None):
    df = data.basic_selection(table_name, column, values, word_list, token)
    
    # Goup by word and group (if defined)
    group_cols = [ "word" ]
    if column != None and column != "":
        group_cols.append("group")
    df.drop("record_id", axis = 1, inplace = True)
    # Sum counts
    output = df.groupby(group_cols).sum().reset_index()
    # Rename columns
    output.rename({ "word": "x", "count": "y" }, axis = 1, inplace = True)
    # If a word list was not provided, cap the number of words returned at 5
    if len(word_list) == 0:
        top_words = output.groupby("x")["y"].sum().sort_values(ascending=False)
        top_words = list(top_words.index)[0:5]
        output = output[output["x"].isin(top_words)]
    
    return output

def tf_idf(table_name: str, column: str, values: list[str], word_list: list[str], token: str | None = None):
    # Get group counts for words
    group_counts = data.group_count_by_words(table_name, word_list, column, token)
    # Get total group count
    total_groups = data.group_count(table_name, column, token)
        
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list, token)
    # Compute smoothed idf
    idf = {}
    for word in df["word"]:
        if group_counts[word] > 0:
            idf[word] = log2(1 + (total_groups / group_counts[word]))
        else:
            idf[word] = 0
    # Group by word and group
    group_cols = [ "word", "group" ]
    df.drop("record_id", axis = 1, inplace = True)
    # Sum counts
    output = df.groupby(group_cols).sum().reset_index()
    # Log normalize counts (tf)
    output["count"] = 1 + log2(output["count"])
    # Join with idf
    idf_lst = []
    for _, row in output.iterrows():
        idf_lst.append(idf[row["word"]])
    output["idf"] = idf_lst
    # Compute tf-idf
    output["tf_idf"] = output["count"] / output["idf"]
    # Drop unneeded columns
    output.drop(["count", "idf"], axis = 1, inplace = True)
    # Rearrange columns
    output = output.pivot(index = "word", columns = "group", values = "tf_idf").reset_index().fillna(0)
    # Rename columns
    output.rename({ f"{ values[0] }": "x", f"{ values[1] }": "y" }, axis = 1, inplace = True)
    
    return output

def proportions(table_name: str, column: str, values: list[str], word_list: list[str], token: str | None = None):
    df = data.basic_selection(table_name, column, values, [], token)
    
    cols = ["word"]
    if column is not None and column != "":
        cols.append("group")
    df.drop("record_id", axis = 1, inplace = True)
    # Get word and group counts
    output = df.groupby(cols).sum().reset_index()
    # Get group total counts
    if "group" in cols:
        group_counts = output.groupby("group")["count"].sum().reset_index()
        group_counts.rename(columns = { "count": "total" }, inplace = True)
        output = merge(output, group_counts, on = "group")
    else:
        output["total"] = output["count"].sum()
    # Filter for word list
    if len(word_list) > 0:
        output = output[output["word"].isin(word_list)]
    # Calculate proportion by group
    output["proportion"] = output["count"] / output["total"]
    output.drop(["count", "total"], axis = 1, inplace = True) 
    # Rename columns
    output.rename({ "word": "x", "proportion": "y" }, axis = 1, inplace = True)
    # If a word list was not provided, cap the number of words returned at 5
    if len(word_list) == 0:
        top_words = output.groupby("x")["y"].sum().sort_values(ascending=False)
        top_words = list(top_words.index)[0:5]
        output = output[output["x"].isin(top_words)]
    
    return output

def jsd(table_name: str, column: str, values: list[str], word_list: list[str], token: str | None = None):
    df = data.basic_selection(table_name, column, values, word_list, token)
    
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
    
def log_likelihood(table_name: str, column: str, values: list[str], word_list: list[str], token: str | None = None):
    # Get the total number of words in the corpus
    total_corpus_words = data.total_word_count(table_name, token)
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list, token)
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