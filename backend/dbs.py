import os
import sqlite3
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Default local DB
DB_PATH = "./referral.db"
DATABASE_URL = os.getenv("DATABASE_URL")

def inspect_sqlite(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print("📦 Tables found in SQLite DB:\n")
    for (table,) in tables:
        print(f"🔹 {table}")

    print("\n📊 Sample data:\n")
    for (table,) in tables:
        print(f"--- {table.upper()} ---")
        try:
            cursor.execute(f"SELECT * FROM {table} LIMIT 5;")
            rows = cursor.fetchall()
            col_names = [description[0] for description in cursor.description]
            print(" | ".join(col_names))
            for row in rows:
                print(" | ".join(str(cell) for cell in row))
        except Exception as e:
            print(f"Error reading {table}: {e}")
        print("")
    conn.close()


def inspect_postgres(url):
    conn = psycopg2.connect(url, sslmode="require")
    cursor = conn.cursor()

    cursor.execute("""SELECT table_name 
                      FROM information_schema.tables 
                      WHERE table_schema='public';""")
    tables = cursor.fetchall()

    print("📦 Tables found in Postgres DB:\n")
    for (table,) in tables:
        print(f"🔹 {table}")

    print("\n📊 Sample data:\n")
    for (table,) in tables:
        print(f"--- {table.upper()} ---")
        try:
            cursor.execute(f"SELECT * FROM {table} LIMIT 5;")
            rows = cursor.fetchall()
            col_names = [desc[0] for desc in cursor.description]
            print(" | ".join(col_names))
            for row in rows:
                print(" | ".join(str(cell) for cell in row))
        except Exception as e:
            print(f"Error reading {table}: {e}")
        print("")
    conn.close()


if __name__ == "__main__":
    if DATABASE_URL:
        print("🔗 Connecting to Postgres...")
        inspect_postgres(DATABASE_URL)
    else:
        print("📂 Connecting to SQLite...")
        inspect_sqlite(DB_PATH)
