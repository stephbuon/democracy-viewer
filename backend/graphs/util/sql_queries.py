import pandas as pd
# Database Interaction
from sqlalchemy import Engine, MetaData, join, select
# Update directory to import util
from util.sql_alchemy_tables import DatasetSplitText

# Select records by group and word lists
def basic_selection(engine: Engine, meta: MetaData, table_name: str, column: str | None, values: list[str], word_list: list[str]):
    table = meta.tables[table_name]
    query = (
        select(
            table.c.get("id"), 
            DatasetSplitText.word,
            DatasetSplitText.count
        )
        .join(
            DatasetSplitText,
            DatasetSplitText.record_id == table.c.get("id")
        )
    )
    
    if column != None:
        query = query.add_columns(table.c.get(column))
        
    query = query.where(DatasetSplitText.table_name == table_name)
    
    if column != None and len(values) > 0:
        query = query.where(table.c.get(column).in_(values))
        
    if len(word_list) > 0:
        query = query.where(DatasetSplitText.word.in_(word_list))
        
    query = query.order_by(DatasetSplitText.word)
    
    records = []
    with engine.connect() as conn:
        for row in conn.execute(query):
            records.append(row)
        conn.commit()

    df = pd.DataFrame({
        "id": list(map(lambda x: x[0], records)),
        "word": list(map(lambda x: x[1], records)),
        "count": list(map(lambda x: x[2], records))
    })
    if column != None:
        df["group"] = list(map(lambda x: x[3], records))
        
    return df
        
# Get number of records that include a word
# def word_record_count(engine: Engine, table_name: str, word: str)