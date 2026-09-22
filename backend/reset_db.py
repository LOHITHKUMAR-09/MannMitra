"""
reset_db.py — Drops all app tables and recreates them fresh.
Run this once when the schema has changed: python reset_db.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.database import engine, Base
import app.models  # noqa — register all models

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Creating tables with current schema...")
Base.metadata.create_all(bind=engine)
print("Done. Schema is fresh.")
