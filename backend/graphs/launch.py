import time
start_time = time.time()
# Import metrics
import util.metrics as metrics
# Other imports
import sys
import json
import os
import jwt
# Database Interaction
from sqlalchemy import create_engine, MetaData, select
# Update directory to import util
import util.sql_alchemy_tables as tables
# Word processing
from util.word_processing import lemmatize_nltk, stem_nltk
print("Import time: {} minutes".format((time.time() - start_time) / 60))

# Get input file from command line argument
params_file = sys.argv[1]

# Load distributed connection if defined
start_time = time.time()
try:
    DB_CREDS_TOKEN = sys.argv[2]
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
    conn_str = "mssql+pyodbc://{}:{}@{}:{}/{}?driver=ODBC+Driver+18+for+SQL+Server".format(
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
    elif client == "pg":
        conn_str = "postgresql+psycopg2://"
    else:
        raise Exception("Unrecognized client:", client)
    conn_str += creds["username"]
    if "password" in creds.keys():
        conn_str += ":{}".format(creds["password"])
    conn_str += "@{}".format(creds["host"])
    if "port" in creds.keys():
        conn_str += ":{}".format(creds["port"])
    conn_str += "/{}".format(creds["db"])
    if client == "mssql":
        conn_str += "?driver=ODBC+Driver+18+for+SQL+Server"
        
engine = create_engine(conn_str)
meta = MetaData()
meta.reflect(engine)
print("Connection time: {} minutes".format((time.time() - start_time) / 60))

start_time = time.time()
# Parse input files
with open(params_file, "r") as file:
    params = json.load(file)
    
# Get metadata to determine preprocessing type
query = (
    select(tables.DatasetMetadata)
    .where(tables.DatasetMetadata.table_name == params["table_name"])
)
with engine.connect() as conn:
    for row in conn.execute(query):
        preprocessing_type = row[0]
        break
    conn.commit()

# If group_list or word_list are not in params, set to empty list
# Also remove Nones from lists
if "group_list" not in params.keys():
    params["group_list"] = []
if "word_list" not in params.keys():
    params["word_list"] = []
    
# Lemmatize or stem words in word_list
if preprocessing_type == "stem":
    params["word_list"] = list(map(lambda x: stem_nltk(x)[0], params["word_list"]))
elif preprocessing_type == "lemma":
    params["word_list"] = list(map(lemmatize_nltk, params["word_list"]))
print("Parameter processing time: {} minutes".format((time.time() - start_time) / 60))

# Call function based on given metric
start_time = time.time()
if params["metric"] == "counts":
    output = metrics.counts(engine, meta, params["table_name"], params["group_name"], params["group_list"], params["word_list"])
elif params["metric"] == "ll":
    output = metrics.log_likelihood(engine, meta, params["table_name"], params["group_name"], params["group_list"], params["word_list"])
elif params["metric"] == "jsd":
    output = metrics.jsd(engine, meta, params["table_name"], params["group_name"], params["group_list"], params["word_list"])
elif params["metric"] == "tf-idf":
    output = metrics.tf_idf(engine, meta, params["table_name"], params["group_name"], params["group_list"], params["word_list"])
elif params["metric"] == "proportion":
    output = metrics.proportions(engine, meta, params["table_name"], params["group_name"], params["group_list"], params["word_list"])
else:
    sys.exit("Invalid metric: " + params["metric"])
print("Computation time: {} minutes".format((time.time() - start_time) / 60))

output_file = params_file.replace("/input/", "/output/")
output.to_json(output_file, orient = "records")