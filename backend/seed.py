"""
seed.py — Creates hardcoded test users in the database
Run once after setup: python seed.py
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.utils.security import hash_password
import app.models  # noqa

TEST_USERS = [
    { "email": "admin@mannmitra.dev",    "password": "Admin@1234",   "display_name": "Admin User"   },
    { "email": "student1@mannmitra.dev", "password": "Student@1234", "display_name": "Priya Sharma" },
    { "email": "student2@mannmitra.dev", "password": "Student@1234", "display_name": "Arjun Mehta"  },
    { "email": "demo@mannmitra.dev",     "password": "Demo@1234",    "display_name": "Demo User"    },
]

def seed():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    created = skipped = 0
    try:
        for u in TEST_USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                print(f"  [SKIP] {u['email']} already exists")
                skipped += 1
                continue
            db.add(User(
                email=u["email"],
                display_name=u["display_name"],
                hashed_password=hash_password(u["password"]),
            ))
            created += 1
            print(f"  [OK]   {u['email']}  |  password: {u['password']}")
        db.commit()
        print(f"\nDone -- {created} created, {skipped} skipped.")
    except Exception as e:
        db.rollback()
        print(f"\nERROR: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
