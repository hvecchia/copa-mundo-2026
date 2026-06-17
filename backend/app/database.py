import sqlite3
from contextlib import contextmanager
from pathlib import Path

# Resolve para backend/db/copa2026.db independente de onde o servidor é iniciado
DB_PATH = Path(__file__).parent.parent / "db" / "copa2026.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()
