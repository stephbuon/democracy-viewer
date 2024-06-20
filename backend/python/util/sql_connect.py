from jwt import decode
from os import environ
from sys import argv

def sql_connect(creds_token: str | None):
    if creds_token != None:
        secret = environ.get("TOKEN_SECRET")
        DB_CREDS = decode(creds_token, secret, "HS256")
    else: 
        DB_CREDS = None

    if DB_CREDS == None:
        # Connect to default database if no distributed connection
        # Load environment variables
        host = environ.get("HOST")
        database = environ.get("DATABASE")
        port = environ.get("PORT")
        username = environ.get("DATABASE_USERNAME")
        password = environ.get("PASSWORD")
        client = "mysql"

        # Connect to database
        conn_str = "mysql+pymysql://{}:{}@{}:{}/{}".format(
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