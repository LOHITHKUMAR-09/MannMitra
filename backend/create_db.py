import psycopg2

try:
    conn = psycopg2.connect(host='localhost', user='postgres', password='postgres', dbname='postgres')
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database WHERE datname='mannmitra'")
    exists = cur.fetchone()
    if exists:
        print("Database 'mannmitra' already exists.")
    else:
        cur.execute("CREATE DATABASE mannmitra")
        print("Database 'mannmitra' created successfully.")
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
    print("\nMake sure PostgreSQL is running and the password is correct.")
    print("Update DATABASE_URL in .env if your password differs from 'postgres'")
