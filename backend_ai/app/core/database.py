import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# In production, this would be an environment variable. 
# We are hardcoding the Docker credentials for this local MVP phase.
SQLALCHEMY_DATABASE_URL = "postgresql://admin:password@db:5432/bio_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to yield database sessions to our endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()