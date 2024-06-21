from pandas import read_csv, read_excel, read_parquet
from sys import argv

# Get filename and extension
filename = argv[1]
ext = filename.split(".")[-1]

# Parse file with correct pandas function
if ext == "csv":
    data = read_csv(filename)
elif ext == "xls" or ext == "xlsx":
    data = read_excel(filename)
    new_filename = filename.replace(ext, "csv")
    data.to_csv(new_filename, index = False)
elif ext == "parquet":
    data = read_parquet(filename, "pyarrow")
else:
    raise Exception("Invalid file extension:", ext)

# Output json with head of the table
head = data.head(5)
filename_json = filename.replace(ext, "json")
head_json = head.to_json(filename_json, orient = "records", indent = 4)
