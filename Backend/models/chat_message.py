# backend/models/chat_message.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

from models.chat_session import ChatSession

class ChatMessage(Base):
	__tablename__ = "chat_messages"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
	session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
	sender = Column(String, nullable=False)  # 'user' or 'bot'
	message = Column(Text, nullable=False)
	timestamp = Column(DateTime, default=datetime.utcnow)

	user = relationship("User", backref="chat_messages")
	session = relationship("ChatSession", back_populates="messages")
