# backend/models/user.py

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # Relationship to UserActivity (using string reference to avoid circular imports)
    activities = relationship("UserActivity", back_populates="user", lazy='dynamic')
    # Relationship to Tasks
    tasks = relationship("Task", back_populates="user", lazy='dynamic')
