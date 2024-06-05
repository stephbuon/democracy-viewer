from pandas import read_csv, read_excel
from sys import argv

# Get filename and extension
filename = argv[1]
ext = filename.split(".")[-1]

# Parse file with correct pandas function
if ext == "csv":
    data = read_csv(filename)
elif ext == "xls" or ext == "xlsx":
    data = read_excel(filename)
else:
    raise Exception("Invalid file extension:", ext)

# Output json with head of the table
head = data.head(5)
filename_json = filename.replace(ext, "json")
head_json = head.to_json(filename_json, orient = "records", indent = 4)
