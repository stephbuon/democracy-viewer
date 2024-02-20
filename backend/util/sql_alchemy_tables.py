from sqlalchemy import Column, Integer, String, Boolean, BigInteger, Date, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base

SQL_BASE = declarative_base()

class DatasetMetadata(SQL_BASE):
    __tablename__ = "dataset_metadata"
    table_name = Column("table_name", String(250), primary_key = True)
    username = Column("username", String(20))
    title = Column("title", String(50))
    description = Column("description", String(200))
    is_public = Column("is_public", Boolean)
    clicks = Column("clicks", Integer)
    record_count = Column("record_count", BigInteger)
    date_posted = Column("date_posted", Date)
    
class DatasetTextCols(SQL_BASE):
    __tablename__ = "dataset_text_cols"
    table_name = Column("table_name", String(250), ForeignKey(DatasetMetadata.table_name), primary_key = True)
    col = Column("col", String(100), primary_key = True)
    
