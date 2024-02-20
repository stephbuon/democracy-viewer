import pandas as pd
import sys
from dotenv import load_dotenv
import os
import time
import jwt
# Database interaction
# import pyodbc
# import mysql.connector as mysql
from sqlalchemy import create_engine, update, MetaData
from sqlalchemy import Column, Integer, String, Float, Text, Table, BigInteger
import sql_alchemy_tables as tables
from bcpandas import to_sql, SqlCreds

load_dotenv()

METADATA_TABLE = "dataset_metadata"
# Get table name and file name from command line argument
TABLE_NAME = sys.argv[1]
FILE_NAME = sys.argv[2]
# Load distributed connection if defined
try:
    DB_CREDS_TOKEN = sys.argv[3]
except:
    DB_CREDS_TOKEN = None
if DB_CREDS_TOKEN != None:
    secret = os.environ.get("TOKEN_SECRET")
    DB_CREDS = jwt.decode(DB_CREDS_TOKEN, secret, "HS256")
else: 
    DB_CREDS = None

if DB_CREDS == None:
    # Connect to default database if no distributed connection
    # Load environment variables
    host = os.environ.get("HOST")
    database = os.environ.get("DATABASE")
    port = os.environ.get("PORT")
    username = os.environ.get("DATABASE_USERNAME")
    password = os.environ.get("PASSWORD")

    # Connect to database
    # CONNECTION_STR = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER='+server+','+port+';DATABASE='+database+';UID='+username+';PWD='+ password
    # conn = pyodbc.connect(CONNECTION_STR)
    conn_str = "postgresql://{}:{}@{}:{}/{}".format(
            username, password, host, port, database
        )
    
else:
    # Connect to distributed connection
    client = DB_CREDS["client"]
    creds = { key: DB_CREDS[key] for key in ["host", "db", "port", "username", "password"]}
    # Create connection for client
    if client == "mssql":
        conn_str = "mssql+pyodbc://"
    elif client == "mysql":
        conn_str = "mysql+pymysql://"
    else:
        raise Exception("Unrecognized client:", client)
    conn_str += creds["username"]
    if "password" in creds.keys():
        conn_str += ":{}".format(creds["password"])
    conn_str += "@{}".format(creds["host"])
    if "port" in creds.keys():
        conn_str += ":{}".format(creds["port"])
    conn_str += "/{}".format(creds["db"])
        
engine = create_engine(conn_str)
meta = MetaData()
# meta.create_all(engine)
meta.reflect(engine)

# Load and process the data
# Create table in database
def prep_data():
    start = time.time()
    
    # Read file
    df = pd.read_csv(FILE_NAME)
    
    # Replace spaces in column names with underscores
    df.columns = df.columns.str.replace(' ', '_').str.replace("\r", "").str.replace("\n", "")
    # Remove line breaks and tabs
    df = df.replace(to_replace=[r"\\t|\\n|\\r", "\t|\n|\r"], value=["",""], regex=True)
    
    # Update metadata to include number of records
    # query = '''
    #     UPDATE {}
    #     SET record_count = ?
    #     WHERE table_name = ?
    # '''.format(METADATA_TABLE)
    # cursor.execute(query, (len(df), TABLE_NAME))
    query = (
        update(tables.Metadata)
            .where(tables.Metadata.table_name == TABLE_NAME)
            .values(record_count = len(df))
    )
    # with engine.connect() as conn:
    #     conn.execute(query1)
        # conn.commit()
    
    
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
    # query = "CREATE TABLE {} (id BIGINT PRIMARY KEY IDENTITY".format(TABLE_NAME)
    # for col in df.columns:
    #     # Determine what type to make each column
    #     query += ", {} ".format(col)
    #     col_type = df[col].dtype
    #     if col_type == "int":
    #         query += "INTEGER"
    #     elif col_type == "float":
    #         query += "FLOAT"
    #     elif maxLengths[col] > 4000:
    #         query += "NVARCHAR(MAX)"
    #     else:
    #         query += "NVARCHAR({})".format(maxLengths[col])
    # query += ")"
    
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
    # new_table = Table(TABLE_NAME, meta, *columns)
    # new_table.create(engine)
    
    with engine.connect() as conn:
        conn.execute(query)
        conn.commit()
    
    print("Prepping data: {} minutes".format((time.time() - start) / 60))
    
    return df

# Insert data into database
def insert_records(df: pd.DataFrame):
    start = time.time()
    # creds = SqlCreds(server, database, username, password, 18, port)
    # creds = SqlCreds.from_engine(engine)
    # Suppress printed output
    # text_trap = io.StringIO()
    # sys.stdout = text_trap
    # Insert data into database
    # to_sql(
    #     df,
    #     TABLE_NAME,
    #     creds,
    #     index = False,
    #     if_exists = "append",
    #     batch_size = min(50000, len(df))
    # )
    with engine.connect() as conn:
        df.to_sql(TABLE_NAME, conn, if_exists = "append", index = False)
        conn.commit()
    # Allow printing again
    # sys.stdout = sys.__stdout__
    print("Inserting data: {} minutes".format((time.time() - start) / 60))

start_time = time.time()
df = prep_data()
insert_records(df)
print("Total time: {} minutes".format((time.time() - start_time) / 60))