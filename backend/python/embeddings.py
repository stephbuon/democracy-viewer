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

# Get distributed token if defined
try:
    TOKEN = argv[2]
except:
    TOKEN = None
    
engine, meta = sql_connect()

# Compute and save embeddings
start_time = time()
compute_embeddings(engine, meta, TABLE_NAME, TOKEN)
print("Computation time: {} minutes".format((time() - start_time) / 60))