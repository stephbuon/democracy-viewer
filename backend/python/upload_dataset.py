from pandas import DataFrame, read_csv
from sys import argv
from time import time
# Database interaction
from util.sql_connect import sql_connect
from bcpandas import to_sql, SqlCreds
from sqlalchemy import create_engine, update, MetaData, Table, Column, Integer, String, BigInteger, Float, Text
from util.sqlalchemy_tables import DatasetMetadata

METADATA_TABLE = "dataset_metadata"
# Get table name and file name from command line argument
TABLE_NAME = argv[1]
FILE_NAME = argv[2]
# Load distributed connection if defined
start_time = time()
try:
    DB_CREDS_TOKEN = argv[3]
except:
    DB_CREDS_TOKEN = None
conn_str, client = sql_connect(DB_CREDS_TOKEN)
engine = create_engine(conn_str)
meta = MetaData()
meta.reflect(engine)
print("Connection time: {} minutes".format((time() - start_time) / 60))

# Load and process the data
# Create table in database
def prep_data():
    start = time()
    
    # Read file
    df = read_csv(FILE_NAME)
    
    # Replace spaces in column names with underscores
    df.columns = df.columns.str.replace(' ', '_').str.replace("\r", "").str.replace("\n", "")
    # Remove line breaks and tabs
    df = df.replace(to_replace=[r"\\t|\\n|\\r", "\t|\n|\r"], value=["",""], regex=True)
    
    # Update metadata to include number of records
    query = (
        update(DatasetMetadata)
            .where(DatasetMetadata.table_name == TABLE_NAME)
            .values(record_count = len(df))
    )    
    
    # If there is a column called id, change it to id_
    if "id" in df.columns:
        df = df.rename(
            columns = {
                "id": "id_"
            }
        )
        
    # Convert unknown types to strings
    for col in df.columns:
        if df[col].dtype not in ["object", "int", "float"]:
            df[col] = df[col].astype(str)
        
    # Determine the maximum length for each string column
    maxLengths = {}
    for col in df.select_dtypes(include=['object']).columns:
        maxLengths[col] = int(df[col].str.len().max() * 1.1)
        # Filter out columns with a length of 0
        if maxLengths[col] == 0:
            del maxLengths[col]
            df = df.drop(col, axis = 1)
            
    # Create new table in database
    columns = [ Column("id", BigInteger, autoincrement = True, primary_key = True) ]
    for col in df.columns:
        col_type = df[col].dtype
        if col_type == "int":
            columns.append(Column(col, Integer))
        elif col_type == "float":
            columns.append(Column(col, Float))
        elif maxLengths[col] > 4000:
            columns.append(Column(col, Text))
        else:
            columns.append(Column(col, String(maxLengths[col])))
    new_table = Table(TABLE_NAME, meta, *columns)
    new_table.create(engine)
    
    with engine.connect() as conn:
        conn.execute(query)
        conn.commit()
    
    print("Prepping data: {} minutes".format((time() - start) / 60))
    
    return df

# Insert data into database
def insert_records(df: DataFrame):
    start = time()
    if client == "mssql":
        creds = SqlCreds.from_engine(engine)
        to_sql(
            df,
            TABLE_NAME,
            creds,
            index = False,
            if_exists = "append",
            batch_size = min(50000, len(df))
        )
    else:
        with engine.connect() as conn:
            df.to_sql(
                TABLE_NAME, 
                conn, 
                if_exists = "append", 
                index = False, 
                chunksize = min(50000, len(df))
            )
            conn.commit()
    print("Inserting data: {} minutes".format((time() - start) / 60))

df = prep_data()
insert_records(df)
print("Total time: {} minutes".format((time() - start_time) / 60))