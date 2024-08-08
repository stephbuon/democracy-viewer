import polars as pl
from sqlalchemy import Engine
import util.s3 as s3
import util.sql_queries as sql

# Retrieve data from s3 and keep required data
def get_text(engine: Engine, table_name: str, token: str | None = None) -> pl.LazyFrame:
    # Get all text columns
    text_cols = sql.get_text_cols(engine, table_name)
    
    # Download raw data from s3
    df_raw = s3.download("datasets", table_name, token)
    # Reformat data to prep for preprocessing
    df = []
    for col in text_cols:
        df.append((
            df_raw.select([col, "record_id"])
                .rename({ f"{col}": "text" })
                .with_columns(col=col)
        ))
    df = pl.concat(df)
    
    return df

# Get the values of a subset of columns for each record
def get_columns(table_name: str, columns: list[str], token: str | None = None) -> pl.LazyFrame:
    df = s3.download("datasets", table_name, token)
    
    return df.select(columns)

# Select records by group and word lists
def basic_selection(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> pl.LazyFrame:
    # Download raw and tokenized data
    df_raw = s3.download("datasets", table_name, token)
    df_split = s3.download("tokens", table_name, token)
    df_tokens = df_split.clone()
    
    # Subset of columns to keep at the end
    cols = ["record_id", "word", "count"]
    
    # If grouping values are defined, filter by them
    if column is not None and column != "":
        df_raw = df_raw.rename({ column: "group" })
        cols.append("group")
        if len(values) > 0:
            df_raw = df_raw.filter(pl.col("group").is_in(values))
            
    # If a word list is defined, filter by it
    if len(word_list) > 0:
        df_split = df_split.filter(pl.col("word").is_in(word_list)) 
    
    # Filter words by POS if list given
    if len(pos_list) > 0:
        df_split = df_split.filter(pl.col("pos").is_in(pos_list))
        # Collocates
        if "adj-noun" in pos_list:
            pairs = adj_noun_pairs(df_tokens, word_list)
            df_split = pl.concat([df_split, pairs])
        if "subj-verb" in pos_list:
            pairs = subj_verb_pairs(df_tokens, word_list)
            df_split = pl.concat([df_split, pairs])
    
    # Merge datasets
    df_raw = df_raw
    df = df_raw.join(df_split, on = "record_id")
    
    return df

# POS collocates
### Adjective/Noun
def adj_noun_pairs(tokens: pl.LazyFrame, word_list: list[str]) -> pl.LazyFrame:
    nouns = tokens.filter(pl.col("pos") == "noun")
    adjs = tokens.filter(pl.col("pos") == "adj")
    pairs = adjs.join(nouns, left_on = ["record_id", "col", "head"], right_on = ["record_id", "col", "word"])
    
    if len(word_list) > 0:
        pairs = pairs.filter((pl.col("word_x").is_in(word_list)) | (pl.col("word_y").is_in(word_list)))
        
    if len(pairs) == 0:
        return pl.LazyFrame()
        
    pairs = pairs.with_columns(
        count = pl.max_horizontal("count_x", "count_y"),
        word = pl.concat_str(["word_x", "word_y"], separator=" ")
    )
    pairs = pairs.drop([ col for col in pairs.collect_schema().names() if "_" in col and col != "record_id" ])
    
    return pairs
       
### Subject/Verb
def subj_verb_pairs(tokens: pl.LazyFrame, word_list: list[str]) -> pl.LazyFrame:
    subjects = tokens.filter(pl.col("dep").is_in(["nsubj", "nsubjpass"]))
    verbs = tokens.filter(pl.col("pos") == "verb")
    
    if len(word_list) > 0:
        subjects = subjects.filter(pl.col("word").is_in(word_list))
        verbs = verbs.filter(pl.col("word").is_in(word_list))
    
    verb_first = verbs.join(subjects, left_on = ["record_id", "col", "head"], right_on = ["record_id", "col", "word"])
    verb_second = verbs.join(subjects, left_on = ["record_id", "col", "word"], right_on = ["record_id", "col", "head"])
    pairs = pl.concat([verb_first, verb_second])
    
    if len(word_list) > 0:
        pairs = pairs[(pairs["word_x"].isin(word_list) | (pairs["word_y"].isin(word_list)))]
        pairs = pairs.filter((pl.col("word_x").is_in(word_list)) | (pl.col("word_y").is_in(word_list)))
        
    if len(pairs) == 0:
        return pl.LazyFrame()
    
    pairs = pairs.with_columns(
        count = pl.max_horizontal("count_x", "count_y"),
        word = pl.concat_str(["word_x", "word_y"], separator=" ")
    )
    pairs = pairs.drop([ col for col in pairs.collect_schema().names() if "_" in col and col != "record_id" ])
    
    return pairs

# Get number of group values that include words
def group_count_by_words(table_name: str, word_list: list[str], column: str | None, values: list[str], token: str | None = None) -> dict[str, int]:
    # Download raw and tokenized data
    df_raw = s3.download("datasets", table_name, token)
    df_split = s3.download("tokens", table_name, token)
    
    # Filter by word list
    if len(word_list) > 0:
        df_split = df_split.filter(pl.col("word").is_in(word_list))
    
    # Merge datasets
    df = df_raw.join(df_split, on = "record_id")
    
    if column is None or column == "":
        df = (
            df
                .group_by("word")
                .count()
        )
    elif len(values) > 0:
        df = (
            df
                .filter(pl.col(column).is_in(values))
                .group_by("word")
                .agg(count = pl.col(column).n_unique())
        )
    else:
        df = (
            df
                .group_by("word")
                .agg(count = pl.col(column).n_unique())
        )
    
    # Get record/group count for each word
    records = {}
    df = df.collect()
    for row in df.iter_rows(named = True):
        records[row["word"]] = row["count"]
        
    return records

# Get the total number of distinct group values
def group_count(table_name: str, column: str, token: str | None = None) -> int:
    # Download raw data
    df_raw = s3.download("datasets", table_name, token)
    
    # Get distinct values in column
    n_unique = (
        df_raw
            .select(pl.col(column).n_unique())
            .collect()
            .get_column(column)
            .to_list()[0]
    )
        
    return n_unique

# Get the total word count in a corpus
def total_word_count(table_name: str, token: str | None = None) -> int:
    # Download tokenized data
    df_split = s3.download("tokens", table_name, token)
    
    # Return sum of count column
    cnt = (
        df_split
            .select(pl.col("count").sum())
            .collect()
            .get_column("count")
            .to_list()[0]
    )
    
    return cnt

# Get the count of the given words in a corpus
def word_counts(table_name: str, word_list: list[str], token: str | None = None) -> dict[str, int]:
    # Download tokenized data
    df_split = s3.download("tokens", table_name, token)
    
    
    df_split = (
        df_split
            # Filter for words in word_list
            .filter(pl.col("word").is_in(word_list))
            .select(["word", "count"])
            # Sum the counts for each word
            .group_by("word")
            .agg(count = pl.col("count").sum())
            .collect()
    )
    
    # Convert to dict for easy access
    records = {}
    for row in df_split.iter_rows(named = True):
        records[row["word"]] = row["count"]
        
    return records

# Get the word count of group values
def group_counts(table_name: str, column: str, values: list[str], token: str | None = None) -> dict[str, int]:
    # Download raw and tokenized data
    df_raw = s3.download("datasets", table_name, token)
    df_split = s3.download("tokens", table_name, token)
    
    # Filter raw data for column values
    if len(values) > 0:
        df_raw = df_raw.filter(pl.col(column).is_in(values))
    
    # Merge datasets
    df = df_raw.join(df_split, on = "record_id")
    
    df = (
        df_raw
            .select(["__id__", column])
            .join(df_split, left_on = "__id__", right_on = "record_id")
            .group_by(column)
            .agg(count = pl.col("count").sum())
            .collect()
    )
        
    records = {}
    for row in df.iter_rows(named = True):
        records[row[column]] = row["count"]
        
    return records