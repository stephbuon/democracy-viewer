from sqlalchemy import Column, Integer, String, Boolean, BigInteger, Date
from sqlalchemy.ext.declarative import declarative_base

SQL_BASE = declarative_base()

class Metadata(SQL_BASE):
    __tablename__ = "dataset_metadata"
    table_name = Column("table_name", String(250), primary_key = True)
    username = Column("username", String(20))
    title = Column("title", String(50))
    description = Column("description", String(200))
    is_public = Column("is_public", Boolean)
    clicks = Column("clicks", Integer)
    record_count = Column("record_count", BigInteger)
    date_posed = Column("date_posed", Date)
    
