from numpy import log, log2, sum
from pandas import DataFrame, concat, merge
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
    output["ids"] = list(set(ids["ids"]))
    
    return output

def tf_idf(engine: Engine, meta: MetaData, table_name: str, column: str, values: list[str], word_list: list[str]):
    # Get group counts for words
    group_counts = queries.group_count_by_words(engine, meta, table_name, word_list, column)
    # Get total group count
    total_groups = queries.group_count(engine, meta, table_name, column)
    # Compute smoothed idf
    idf = {}
    for word in word_list:
        idf[word] = log2(1 + (total_groups / group_counts[word]))
        
    # Get records by words and groups
    data = queries.basic_selection(engine, meta, table_name, column, values, word_list)
    # Group by word and group
    group_cols = [ "word", "group" ]
    # Store ids as list
    ids = data.groupby("word")["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Sum counts
    output = data.groupby(group_cols).sum().reset_index()
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
    output["ids"] = list(set(ids["ids"]))
    
    return output

def proportions(engine: Engine, meta: MetaData, table_name: str, column: str, values: list[str], word_list: list[str]):
    data = queries.basic_selection(engine, meta, table_name, column, values, word_list)
    
    # Store ids as list
    ids = data.groupby(["word", "group"])["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Get word and group counts
    output = data.groupby(["word", "group"]).sum().reset_index()
    # Get group total counts
    group_counts = output.groupby("group")["count"].sum().reset_index()
    group_counts.rename(columns = { "count": "total" }, inplace = True)
    output = merge(output, group_counts, on = "group")
    # Calculate proportion by group
    output["proportion"] = output["count"] / output["total"]
    output.drop(["count", "total"], axis = 1, inplace = True) 
        
    # Add ids
    output["ids"] = list(set(ids["ids"]))
    
    return output

def jsd(engine: Engine, meta: MetaData, table_name: str, column: str, values: list[str], word_list: list[str]):
    data = queries.basic_selection(engine, meta, table_name, column, values, word_list)
    
    # Store ids as list
    ids = data.groupby("group")["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Get distinct groups
    groups = data["group"].unique()
    # Get word and group counts
    data = data.groupby(["word", "group"]).sum()
    # Calculate probabilities
    data["prob"] = data.groupby("group")["count"].transform(lambda x: x / x.sum())
    data = data.drop("count", axis = 1).unstack("group").fillna(0).reset_index()
    data.columns = data.columns.get_level_values(1)
    data.drop("", axis = 1, inplace = True)
    
    # Compare all pairs of groups
    output = []
    for i in range(len(groups)):
        for j in range(i+1, len(groups)):
            # Subset data by current groups
            probs: DataFrame = data[data.columns.intersection([ groups[i], groups[j] ])].copy()
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
                    "ids": [list(set(ids1 + ids2))]
                })
            )
              
    # Concatenate results
    return concat(output)
    
def log_likelihood(engine: Engine, meta: MetaData, table_name: str, column: str, values: list[str], word_list: list[str]):
    # Get the total number of words in the corpus
    total_corpus_words = queries.total_word_count(engine, table_name)
    # Get records by words and groups
    data = queries.basic_selection(engine, meta, table_name, column, values, word_list)
    # Get unique words and groups
    words = data["word"].unique()
    groups = data["group"].unique()
    # Goup by word and group (if defined)
    group_cols = [ "word", "group" ]
    # Store ids as list
    ids = data.groupby("word")["id"].apply(list).reset_index(name = "ids")
    data.drop("id", axis = 1, inplace = True)
    # Sum counts
    data = data.groupby(group_cols).sum().unstack("group").fillna(0)
    data.columns = data.columns.get_level_values(1)
    output = []
    for word in words:
        # Initialize df for word
        df = DataFrame({
            "word": [word]
        })
        for group in groups:
            # Compute LL terms
            a = data.loc[word, group]
            b = data.loc[word,:].sum() - a
            c = data.loc[:,group].sum() - a
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
            df[group] = ll
        # Add ids to df 
        df["ids"] = list(set([ids[ids["word"] == word].reset_index()["ids"][0]]))
        output.append(df)
    
    if len(output) > 0:
        return concat(output)
    else:
        return DataFrame()