# backend/db_init.py

from config.database import engine, Base
from models.user import User
from models.user_activity import UserActivity

def init_db():
    """Initialize database with all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")
    print("Tables created: users, user_activities")

if __name__ == "__main__":
    init_db()
