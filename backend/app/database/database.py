from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# Get project base directory
BASE_DIR = Path(__file__).resolve().parent

# Create database folder if not exists (optional safety)
BASE_DIR.mkdir(parents=True, exist_ok=True)

# DB path inside database folder
DATABASE_PATH = BASE_DIR / "ai_icon_generator.db"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
