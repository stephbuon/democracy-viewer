import jwt
import os
from sqlalchemy import create_engine
import sys

def sql_connect():
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
        client = "mssql"

        # Connect to database
        conn_str = "mssql+pyodbc://{}:{}@{}:{}/{}?driver=ODBC+Driver+17+for+SQL+Server".format(
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
            conn_str += "?driver=ODBC+Driver+17+for+SQL+Server"
            
    return ( conn_str, client )