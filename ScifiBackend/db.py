import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

_DATABASE_URL = os.getenv("DATABASE_URL")

if not _DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Add it to ScifiBackend/.env")


def get_connection():
    return psycopg2.connect(_DATABASE_URL)
