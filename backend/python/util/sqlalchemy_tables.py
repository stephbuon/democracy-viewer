from sqlalchemy import Column, Integer, String, Boolean, BigInteger, Date, ForeignKey, Text, Float
from sqlalchemy.ext.declarative import declarative_base

SQL_BASE = declarative_base()

class Users(SQL_BASE):
    __tablename__ = "users"
    username = Column("username", String(20), primary_key = True)
    password = Column("password", String(60))
    email = Column("email", String(30))
    title = Column("title", String(20))
    first_name = Column("first_name", String(20))
    last_name = Column("last_name", String(20))
    suffix = Column("suffix", String(10))
    orcid = Column("orcid", String(16))
    linkedin_link = Column("linkedin_link", String(50))
    website = Column("website", String(50))

class DatasetMetadata(SQL_BASE):
    __tablename__ = "dataset_metadata"
    table_name = Column("table_name", String(250), primary_key = True)
    username = Column("username", String(20), ForeignKey(Users.username))
    title = Column("title", String(50))
    description = Column("description", String(200))
    author = Column("author", String(50))
    date_collected = Column("date_collected", Date)
    is_public = Column("is_public", Boolean)
    clicks = Column("clicks", Integer)
    record_count = Column("record_count", BigInteger)
    preprocessing_type = Column("preprocessing_type", String(5))
    embeddings = Column("embeddings", Boolean)
    pos = Column("pos", Boolean)
    date_posted = Column("date_posted", Date)
    embed_col = Column("embed_col", String(50))
    language = Column("language", String(20))

class DatasetTextCols(SQL_BASE):
    __tablename__ = "dataset_text_cols"
    table_name = Column("table_name", String(250), ForeignKey(DatasetMetadata.table_name), primary_key = True)
    col = Column("col", String(100), primary_key = True)
    
class DatasetSplitText(SQL_BASE):
    __tablename__ = "dataset_split_text"
    table_name = Column("table_name", String(250), ForeignKey(DatasetTextCols.table_name), primary_key = True)
    record_id = Column("record_id", BigInteger, primary_key = True)
    word = Column("word", String(100), primary_key = True)
    pos = Column("pos", String(5), primary_key = True)
    tag = Column("tag", String(5), primary_key = True)
    dep = Column("dep", String(10), primary_key = True)
    head = Column("head", String(100), primary_key = True)
    count = Column("count", BigInteger)
    col = Column("col", String(100), ForeignKey(DatasetTextCols.col), primary_key = True)