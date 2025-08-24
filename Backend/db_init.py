# backend/db_init.py

from config.database import engine, Base
from models.user import User

from models.user_activity import UserActivity
from models.chat_message import ChatMessage
from models.chat_session import ChatSession
from models.employee_data import Task, Event, Meeting

def init_db():
    """Initialize database with all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")
    print("Tables created: users, user_activities, chat_sessions, chat_messages, tasks, events, meetings")

if __name__ == "__main__":
    init_db()
