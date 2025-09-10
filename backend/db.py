import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# ✅ Pick DATABASE_URL from .env, fallback to local SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./referral.db"   # Default local DB
)

# ✅ Add connect_args only for SQLite or Postgres
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # checks before using connection
        pool_recycle=1800,   # recycle connections every 30 mins
        connect_args={
            "sslmode": "require",
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Base class for all models
Base = declarative_base()

# ✅ Dependency for route handlers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
