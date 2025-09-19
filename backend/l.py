from sqlalchemy import create_engine, inspect, text
import os

# === CONFIGURE YOUR DATABASE URL HERE ===
# Example for Postgres on Render:
# DATABASE_URL = "postgresql+psycopg2://username:password@host:5432/dbname"
# Example for SQLite (local dev):
# DATABASE_URL = "sqlite:///./app.db"

DATABASE_URL = "postgresql+psycopg2://dataset_dk8x_user:9dcreWFr5mDTHYLL02rZe0UzRYr8xlFr@dpg-d2tmct3uibrs73eui9h0-a.oregon-postgres.render.com:5432/dataset_dk8x"

engine = create_engine(DATABASE_URL)

def dump_all_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if not tables:
        print("⚠️ No tables found in the database.")
        return

    with engine.connect() as conn:
        for table in tables:
            print("\n" + "="*50)
            print(f"📌 Table: {table}")
            print("="*50)

            # Get column headers
            columns = [col["name"] for col in inspector.get_columns(table)]
            print("Columns:", columns)

            # Fetch all rows
            result = conn.execute(text(f"SELECT * FROM {table}"))
            rows = result.fetchall()

            if not rows:
                print("No rows in this table.")
            else:
                for row in rows:
                    print(dict(zip(columns, row)))

if __name__ == "__main__":
    dump_all_tables()
