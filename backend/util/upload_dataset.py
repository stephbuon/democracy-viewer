import pandas as pd
import sys
from dotenv import load_dotenv
import os
import time
import io
# Database interaction
import pyodbc
from bcpandas import to_sql, SqlCreds

METADATA_TABLE = "dataset_metadata"
# Get table name and file name from command line argument
TABLE_NAME = sys.argv[1]
FILE_NAME = sys.argv[2]

# Load environment variables
load_dotenv()
server = os.environ.get("HOST")
database = os.environ.get("DATABASE")
port = os.environ.get("PORT")
username = os.environ.get("DATABASE_USERNAME")
password = os.environ.get("PASSWORD")

# Connect to database
CONNECTION_STR = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER='+server+','+port+';DATABASE='+database+';UID='+username+';PWD='+ password
conn = pyodbc.connect(CONNECTION_STR)
cursor = conn.cursor()

# Load and process the data
# Create table in database
def prep_data():
    start = time.time()
    
    # Read file
    df = pd.read_csv(FILE_NAME)
    
    # Update metadata to include number of records
    query = '''
        UPDATE {}
        SET record_count = ?
        WHERE table_name = ?
    '''.format(METADATA_TABLE)
    cursor.execute(query, (len(df), TABLE_NAME))
    
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
    query = "CREATE TABLE {} (id BIGINT PRIMARY KEY IDENTITY".format(TABLE_NAME)
    for col in df.columns:
        # Determine what type to make each column
        query += ", {} ".format(col)
        col_type = df[col].dtype
        if col_type == "int":
            query += "INTEGER"
        elif col_type == "float":
            query += "FLOAT"
        elif maxLengths[col] > 4000:
            query += "NVARCHAR(MAX)"
        else:
            query += "NVARCHAR({})".format(maxLengths[col])
    query += ")"
    cursor.execute(query)
    cursor.commit()
    
    print("Prepping data: {} minutes".format((time.time() - start) / 60))
    
    return df

# Insert data into database
def insert_records(df):
    start = time.time()
    creds = SqlCreds(server, database, username, password, 18, port)
    # Suppress printed output
    text_trap = io.StringIO()
    sys.stdout = text_trap
    # Insert data into database
    to_sql(
        df,
        TABLE_NAME,
        creds,
        index = False,
        if_exists = "append",
        batch_size = 50000
    )
    # Allow printing again
    sys.stdout = sys.__stdout__
    print("Inserting data: {} minutes".format((time.time() - start) / 60))

start_time = time.time()
df = prep_data()
insert_records(df)
cursor.close()
conn.close()
print("Total time: {} minutes".format((time.time() - start_time) / 60))