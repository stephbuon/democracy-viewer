from collections import Counter
from copy import deepcopy
from dotenv import load_dotenv
from pandas import DataFrame, concat, read_csv
from sys import argv
from time import time
# Database interaction
from bcpandas import to_sql, SqlCreds
from sqlalchemy import create_engine, MetaData, select
# SQL helpers
from util.sql_connect import sql_connect
import util.sql_queries as queries
from util.sqlalchemy_tables import DatasetMetadata, DatasetSplitText
# Embeddings helper
from util.embeddings_save import compute_embeddings

# Get table name from command line argument
TABLE_NAME = argv[1]
load_dotenv()

# Load distributed connection if defined
start_time = time()
try:
    DB_CREDS_TOKEN = argv[2]
except:
    DB_CREDS_TOKEN = None
conn_str, client = sql_connect(DB_CREDS_TOKEN)
engine = create_engine(conn_str)
meta = MetaData()
meta.reflect(engine)
print("Connection time: {} seconds".format(time() - start_time))

# Compute and save embeddings
start_time = time()
compute_embeddings(engine, meta, TABLE_NAME)
print("Computation time: {} minutes".format((time() - start_time) / 60))