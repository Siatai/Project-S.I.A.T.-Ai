import sqlite3

# Path to your DB file (adjust if needed)
DB_PATH = "./referral.db"

# Connect to the SQLite DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("📦 Tables found in referral.db:\n")
for (table,) in tables:
    print(f"🔹 {table}")

print("\n📊 Sample data from each table:\n")

# Print sample rows from each table
for (table,) in tables:
    print(f"--- {table.upper()} ---")
    try:
        cursor.execute(f"SELECT * FROM {table} LIMIT 5;")
        rows = cursor.fetchall()
        col_names = [description[0] for description in cursor.description]

        print(" | ".join(col_names))
        for row in rows:
            print(" | ".join(str(cell) for cell in row))
        print("")
    except Exception as e:
        print(f"Error reading {table}: {e}\n")

conn.close()