from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import urllib
import os
from dotenv import load_dotenv

load_dotenv()

params = urllib.parse.quote_plus(
    os.getenv("DB_CONNECTION_STRING", "DRIVER={ODBC Driver 18 for SQL Server};SERVER=.\\SQLEXPRESS;DATABASE=chatbot;Trusted_Connection=yes;TrustServerCertificate=yes;")
)

DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()