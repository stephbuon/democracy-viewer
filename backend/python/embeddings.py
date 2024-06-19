from dotenv import load_dotenv
from sys import argv
from time import time
# Database interaction
from sqlalchemy import create_engine, MetaData
# SQL helpers
from util.sql_connect import sql_connect
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