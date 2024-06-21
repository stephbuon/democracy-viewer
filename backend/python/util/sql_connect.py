from os import environ
from sqlalchemy import Engine, MetaData, create_engine
from time import time

def sql_connect() -> tuple[Engine, MetaData]:
    start_time = time()
    # Connect to default database if no distributed connection
    # Load environment variables
    host = environ.get("HOST")
    database = environ.get("DATABASE")
    port = environ.get("PORT")
    username = environ.get("DATABASE_USERNAME")
    password = environ.get("PASSWORD")

    # Connect to database
    conn_str = "mysql+pymysql://{}:{}@{}:{}/{}".format(
        username, password, host, port, database
    )
            
    engine = create_engine(conn_str)
    meta = MetaData()
    meta.reflect(engine)
    
    print("Connection time: {} seconds".format(time() - start_time))
    
    return engine, meta