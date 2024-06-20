from numpy import ceil, array
from pandas import DataFrame, concat
from time import time
# Database Interaction
from sqlalchemy import Engine, MetaData, select, func, distinct
# Update directory to import util
from util.sqlalchemy_tables import DatasetMetadata, DatasetSplitText, DatasetTextCols

# Get all of the metadata of a dataset
def get_metadata(engine: Engine, meta: MetaData, table_name: str) -> dict:
    # Make query
    query = (
        select(DatasetMetadata)
            .where(DatasetMetadata.table_name == table_name)
    )
    with engine.connect() as conn:
        for row in conn.execute(query):
            output = row
            break
        conn.commit()
        
    # Give column names as keys
    record = {}
    for i, col in enumerate(meta.tables[DatasetMetadata.__tablename__].columns.keys()):
        record[col] = output[i]
        
    return record

# Get the text columns of a dataset
def get_text_cols(engine: Engine, table_name: str) -> list[str]:
    query = (
        select(DatasetTextCols.col)
            .where(DatasetTextCols.table_name == table_name)
    )
    text_cols = []
    with engine.connect() as conn:
        for row in conn.execute(query):
            text_cols.append(row[0])
        conn.commit()
    if len(text_cols) == 0:
        print("No text columns to process")
        exit(1)
    else:
        return text_cols

# Select the text of all text columns for all records
def get_text(engine: Engine, meta: MetaData, table_name: str) -> DataFrame:
    start = time()
    
    # Get total number of records
    metadata = get_metadata(engine, meta, table_name)
    records_cnt = metadata["record_count"]
    page_length = 50000
    pages = int(ceil(records_cnt / page_length))
    
    # Get all text columns
    text_cols = get_text_cols(engine, table_name)
    
    # Get table from metadata
    table = meta.tables[table_name]
    # Array to store all processing threads
    df = []
    for col in text_cols:
        for page in range(pages):
            # Get next 50,000 records from db
            query = (
                select(table.c.get("id"), table.c.get(col))
                    .order_by(table.c.get("id"))
                    .offset(page * page_length)
                    .limit(page_length)
            )
            records = []
            with engine.connect() as conn:
                for row in conn.execute(query):
                    records.append(row)
                conn.commit()
            data = DataFrame({
                "id": list(map(lambda x: x[0], records)),
                "text": list(map(lambda x: x[1], records)),
                "col": col
            })
            df.append(data)
    df = concat(df)
    print("Loading data: {} minutes".format((time() - start) / 60))
    
    return df

# Get the values of a subset of columns for each record
def get_columns(engine: Engine, meta: MetaData, table_name: str, columns: list[str]):
    # Get total number of records
    metadata = get_metadata(engine, meta, table_name)
    records_cnt = metadata["record_count"]
    page_length = 50000
    pages = int(ceil(records_cnt / page_length))
    
    # Select data from table
    table = meta.tables[table_name]
    columns.insert(0, "id")
    select_stmnt = select([ table.c[col] for col in columns ])
    df = []
    for page in range(pages):
        # Get next 50,000 records from db
        query = (
            select_stmnt
                .order_by(table.c.get("id"))
                .offset(page * page_length)
                .limit(page_length)
        )
        records = []
        with engine.connect() as conn:
            for row in conn.execute(query):
                records.append(row)
            conn.commit()
        records = array(records)
        data = DataFrame()
        for i, col in enumerate(columns):
            data[col] = data[:,i]
        df.append(data)
        
    df = concat(df)
    return df

# Select records by group and word lists
def basic_selection(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]) -> DataFrame:
    # Get data table from metadata
    table = meta.tables[table_name]
    query = (
        # Select record id, word, and count
        select(
            table.c.get("id"), 
            DatasetSplitText.word,
            DatasetSplitText.count
        )
        # Join data table with split text
        .join(
            DatasetSplitText,
            DatasetSplitText.record_id == table.c.get("id")
        )
    )
    
    # If grouping column is defined, add it to the selection
    if column != None:
        query = query.add_columns(table.c.get(column))
        
    # Filter by table name
    query = query.where(DatasetSplitText.table_name == table_name)
    
    # If grouping values are defined, filter by them
    if column != None and len(values) > 0:
        query = query.where(table.c.get(column).in_(values))
        
    # If a word list is defined, filter by it
    if len(word_list) > 0:
        query = query.where(DatasetSplitText.word.in_(word_list))
     
    # Sort by the word   
    query = query.order_by(DatasetSplitText.word)
    
    # Submit query and convert to data frame
    records = []
    with engine.connect() as conn:
        for row in conn.execute(query):
            records.append(row)
        conn.commit()
    df = DataFrame({
        "id": list(map(lambda x: x[0], records)),
        "word": list(map(lambda x: x[1], records)),
        "count": list(map(lambda x: x[2], records))
    })
    if column != None:
        df["group"] = list(map(lambda x: str.lower(x[3]), records))
        
    return df
        
# Get number of group values that include words
def group_count_by_words(engine: Engine, meta: MetaData, table_name: str, word_list: list[str], column: str | None) -> dict[str, int]:
    # Get data table from metadata
    table = meta.tables[table_name]
    
    # Select count
    if column != None:
        query = select(DatasetSplitText.word, func.count(distinct(table.c.get(column))))
    else:
        query = select(DatasetSplitText.word, func.count())
    
    # Join data table with split text 
    query = query.join(
        table,
        DatasetSplitText.record_id == table.c.get("id")
    )
    
    # Group by word
    query = query.group_by(DatasetSplitText.word)
    # Filter by word
    query = query.having(DatasetSplitText.word.in_(word_list))
    
    # Submit query and convert to dict
    records = {}
    with engine.connect() as conn:
        for row in conn.execute(query):
            records[row[0]] = row[1]
        conn.commit()
        
    return records

# Get the total number of distinct group values
def group_count(engine: Engine, meta: MetaData, table_name: str, column: str) -> int:
    # Get data table from metadata
    table = meta.tables[table_name]
        
    # Select distinct count
    query = select(func.count(distinct(table.c.get(column))))
    
    # Submit query and return count
    with engine.connect() as conn:
        for row in conn.execute(query):
            count = row[0]
        conn.commit()
        
    return count

# Get the total number of records
def record_count(engine: Engine, meta: MetaData, table_name: str) -> int:
    # Get data table from metadata
    table = meta.tables[table_name]
        
    # Select distinct count
    query = select(func.count(distinct(table.c.get("id"))))
    
    # Submit query and return count
    with engine.connect() as conn:
        for row in conn.execute(query):
            count = row[0]
        conn.commit()
        
    return count

# Get the total word count in a corpus
def total_word_count(engine: Engine, table_name: str) -> int:
    # Select distinct count
    query = (
        select(func.sum(DatasetSplitText.count))
        .where(DatasetSplitText.table_name == table_name)
    )
    
    # Submit query and return count
    with engine.connect() as conn:
        for row in conn.execute(query):
            count = row[0]
        conn.commit()
        
    return count

# Get the count of the given words in a corpus
def word_counts(engine: Engine, table_name: str, word_list: list[str]) -> dict[str, int]:
    # Select distinct count
    query = (
        select(DatasetSplitText.word, func.sum(DatasetSplitText.count))
        .where(DatasetSplitText.table_name == table_name, DatasetSplitText.word.in_(word_list))
        .group_by(DatasetSplitText.word)
    )
    
    # Submit query and convert to dict
    records = {}
    with engine.connect() as conn:
        for row in conn.execute(query):
            records[row[0]] = row[1]
        conn.commit()
        
    return records

# Get the word count of group values
def group_counts(engine: Engine, meta: MetaData, table_name: str, column: str, values: list[str]) -> dict[str, int]:
    # Get data table from metadata
    table = meta.tables[table_name]
        
    # Select distinct count
    query = (
        select(table.c.get(column), func.sum(DatasetSplitText.count))
        .join(table, table.c.get("id") == DatasetSplitText.record_id)
        .where(DatasetSplitText.table_name == table_name, table.c.get(column).in_(values))
        .group_by(table.c.get(column))
    )
    
    # Submit query and convert to dict
    records = {}
    with engine.connect() as conn:
        for row in conn.execute(query):
            col = str.lower(row[0])
            if col in records.keys():
                records[col] += row[1]
            else:
                records[col] = row[1]
        conn.commit()
        
    return records