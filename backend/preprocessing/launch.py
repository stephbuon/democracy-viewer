import pandas as pd
# DB connection
import pyodbc
# Environment variables
import os
from dotenv import load_dotenv
# These will let us use R packages:
from rpy2.robjects.packages import importr
from rpy2.robjects import pandas2ri

# Establish a connection to the database using env login
def connectDB():
    load_dotenv()
    server = os.environ.get("HOST")
    database =  os.environ.get("DATABASE")
    username = os.environ.get("USERNAME")
    password = os.environ.get("PASSWORD")

    print("Connecting to database...")
    cnxn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password)
    print("Connection established")
    # cursor = cnxn.cursor()

    return cnxn

# Convert pandas.DataFrames to R dataframes automatically.
pandas2ri.activate()
# Include needed R packages
dhmeasures = importr("dhmeasures")

# Establish db connection
db = connectDB()

# Get data from db
data = pd.io.sql.read_sql("SELECT * FROM mfunds;", db)

print(data)

db.close()