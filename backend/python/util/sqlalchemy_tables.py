from sqlalchemy import Column, Integer, String, Boolean, BigInteger, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

SQL_BASE = declarative_base()

class Users(SQL_BASE):
    __tablename__ = "users"
    email = Column("email", String(30), primary_key=True)
    password = Column("password", String(60))
    title = Column("title", String(20))
    first_name = Column("first_name", String(20))
    last_name = Column("last_name", String(20))
    suffix = Column("suffix", String(10))
    orcid = Column("orcid", String(16))
    linkedin_link = Column("linkedin_link", String(50))
    website = Column("website", String(50))

class DatasetMetadata(SQL_BASE):
    __tablename__ = "dataset_metadata"
    table_name = Column("table_name", String(100), primary_key = True)
    email = Column("email", String(30), ForeignKey(Users.email))
    title = Column("title", String(50))
    description = Column("description", String(200))
    author = Column("author", String(50))
    date_collected = Column("date_collected", Date)
    is_public = Column("is_public", Boolean)
    clicks = Column("clicks", Integer)
    preprocessing_type = Column("preprocessing_type", String(5))
    embeddings = Column("embeddings", Boolean)
    date_posted = Column("date_posted", Date)
    embed_col = Column("embed_col", String(50))
    language = Column("language", String(20))
    likes = Column("likes", Integer)
    embeddings_done = Column("embeddings_done", Boolean)
    tokens_done = Column("tokens_done", Boolean)
    distributed = Column("distributed", BigInteger)
    unprocessed_updates = Column("unprocessed_updates", Integer)
    uploaded = Column("uploaded", Boolean)
    num_records = Column("num_records", Integer)
    
class Tags(SQL_BASE):
    __tablename__ = "tags"
    table_name = Column("table_name", String(100), ForeignKey(DatasetMetadata.table_name), primary_key = True)
    col = Column("tag_name", String(25), primary_key = True)

class DatasetTextCols(SQL_BASE):
    __tablename__ = "dataset_text_cols"
    table_name = Column("table_name", String(100), ForeignKey(DatasetMetadata.table_name), primary_key = True)
    col = Column("col", String(50), primary_key = True)
    