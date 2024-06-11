from numpy import log, log2, sum
from pandas import DataFrame, concat, merge
# Database interaction
import util.data_queries as data

def counts(table_name: str, column: str | None, values: list[str], word_list: list[str]):
    df = data.basic_selection(table_name, column, values, word_list)
    
    # Goup by word and group (if defined)
    group_cols = [ "word" ]
    if column != None:
        group_cols.append("group")
    # Store ids as list
    ids = df.groupby(group_cols)["record_id"].apply(list).reset_index(name = "ids")
    df.drop("record_id", axis = 1, inplace = True)
    # Sum counts
    output = df.groupby(group_cols).sum().reset_index()
    # Add ids
    output["ids"] = list(map(lambda x: list(sorted(set(x))), ids["ids"]))
    
    return output

def tf_idf(table_name: str, column: str, values: list[str], word_list: list[str]):
    # Get group counts for words
    group_counts = data.group_count_by_words(table_name, word_list, column)
    # Get total group count
    total_groups = data.group_count(table_name, column)
    # Compute smoothed idf
    idf = {}
    for word in word_list:
        idf[word] = log2(1 + (total_groups / group_counts[word]))
        
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list)
    # Group by word and group
    group_cols = [ "word", "group" ]
    # Store ids as list
    ids = data.groupby("word")["record_id"].apply(list).reset_index(name = "ids")
    df.drop("record_id", axis = 1, inplace = True)
    # Sum counts
    output = df.groupby(group_cols).sum().reset_index()
    # Log normalize counts (tf)
    output["count"] = 1 + log2(output["count"])
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
    output["ids"] = list(map(lambda x: list(set(x)), ids["ids"]))
    
    return output

def proportions(table_name: str, column: str, values: list[str], word_list: list[str]):
    df = data.basic_selection(table_name, column, values, word_list)
    
    # Store ids as list
    ids = df.groupby(["word", "group"])["record_id"].apply(list).reset_index(name = "ids")
    df.drop("record_id", axis = 1, inplace = True)
    # Get word and group counts
    output = df.groupby(["word", "group"]).sum().reset_index()
    # Get group total counts
    group_counts = output.groupby("group")["count"].sum().reset_index()
    group_counts.rename(columns = { "count": "total" }, inplace = True)
    output = merge(output, group_counts, on = "group")
    # Calculate proportion by group
    output["proportion"] = output["count"] / output["total"]
    output.drop(["count", "total"], axis = 1, inplace = True) 
        
    # Add ids
    output["ids"] = list(map(lambda x: list(sorted(set(x))), ids["ids"]))
    
    return output

def jsd(table_name: str, column: str, values: list[str], word_list: list[str]):
    df = data.basic_selection(table_name, column, values, word_list)
    
    # Store ids as list
    ids = df.groupby("group")["record_id"].apply(list).reset_index(name = "ids")
    df.drop("record_id", axis = 1, inplace = True)
    # Get distinct groups
    groups = df["group"].unique()
    # Get word and group counts
    df = df.groupby(["word", "group"]).sum()
    # Calculate probabilities
    df["prob"] = df.groupby("group")["count"].transform(lambda x: x / x.sum())
    df = df.drop("count", axis = 1).unstack("group").fillna(0).reset_index()
    df.columns = df.columns.get_level_values(1)
    df.drop("", axis = 1, inplace = True)
    
    # Compare all pairs of groups
    output = []
    for i in range(len(groups)):
        for j in range(i+1, len(groups)):
            # Subset data by current groups
            probs: DataFrame = df[df.columns.intersection([ groups[i], groups[j] ])].copy()
            # Compute average distributio
            m = sum(probs, axis = 1) / probs.shape[1]
            # Compute KLD for each group
            kld = sum(probs * log(probs.div(m, axis = 0)), axis = 1)
            # Compute JSD
            jsd_score = 0.5 * kld.sum()
            # Get ids for each group
            ids1 = ids[ids["group"] == groups[i]].reset_index()["ids"][0]
            ids2 = ids[ids["group"] == groups[j]].reset_index()["ids"][0]
            # Add result to output
            output.append(
                DataFrame({
                    "group1": [groups[i]],
                    "group2": [groups[j]],
                    "jsd": [jsd_score],
                    "ids": [list(sorted(set(ids1 + ids2)))]
                })
            )
              
    # Concatenate results
    if len(output) > 0:
        return concat(output)
    else:
        return DataFrame()
    
def log_likelihood(table_name: str, column: str, values: list[str], word_list: list[str]):
    # Get the total number of words in the corpus
    total_corpus_words = data.total_word_count(table_name)
    # Get records by words and groups
    df = data.basic_selection(table_name, column, values, word_list)
    # Get unique words and groups
    words = df["word"].unique()
    groups = df["group"].unique()
    # Goup by word and group (if defined)
    group_cols = [ "word", "group" ]
    # Store ids as list
    ids = df.groupby("word")["record_id"].apply(list).reset_index(name = "ids")
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
        # Add ids to df 
        df2["ids"] = [list(sorted(ids[ids["word"] == word].reset_index()["ids"][0]))]
        output.append(df2)
    
    if len(output) > 0:
        return concat(output)
    else:
        return DataFrame()