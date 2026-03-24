"""
WARNING: This will destroy any existing data in the database.
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)

SQL_FILE = os.path.join(os.path.dirname(__file__), "..", "DataBase", "Solar Empire.session.sql")

if not os.path.exists(SQL_FILE):
    print(f"ERROR: SQL file not found at {SQL_FILE}")
    sys.exit(1)

with open(SQL_FILE, "r") as f:
    sql = f.read()

print("Connecting to database...")
conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = False

try:
    cur = conn.cursor()
    print("Running schema + seed SQL...")
    cur.execute(sql)
    conn.commit()
    print("Database initialised successfully.")
except Exception as e:
    conn.rollback()
    print(f"ERROR: {e}")
    sys.exit(1)
finally:
    conn.close()
