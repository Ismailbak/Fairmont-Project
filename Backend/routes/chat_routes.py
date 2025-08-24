# Backend/routes/chat_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from config.database import get_db
from middleware.auth_middleware import get_current_active_user
from models.chat_message import ChatMessage
from models.chat_session import ChatSession

from models.user import User
from controllers.chat import generate_ai_response

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Pydantic models
class ChatMessageRequest(BaseModel):
    message: str
    sender: str  # 'user' or 'bot'
    session_id: int

class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    sender: str
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Get chat history for current user

# Get all messages for a session
@router.get("/session/{session_id}", response_model=List[ChatMessageResponse])
def get_session_messages(session_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp).all()
    return messages

# Add a new chat message

# Add a new chat message and generate bot reply
@router.post("/message")
def add_chat_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user)
):
    # Validate session
    session = db.query(ChatSession).filter(ChatSession.id == req.session_id, ChatSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Store user message
    user_msg = ChatMessage(
        user_id=user.id,
        session_id=req.session_id,
        sender="user",
        message=req.message
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Generate bot reply using Llama model
    bot_reply = generate_ai_response(req.message)
    bot_msg = ChatMessage(
        user_id=user.id,
        session_id=req.session_id,
        sender="bot",
        message=bot_reply
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    # Return both messages (user and bot)
    return {
        "user_message": {
            "id": user_msg.id,
            "user_id": user_msg.user_id,
            "sender": user_msg.sender,
            "message": user_msg.message,
            "timestamp": user_msg.timestamp
        },
        "bot_message": {
            "id": bot_msg.id,
            "user_id": bot_msg.user_id,
            "sender": bot_msg.sender,
            "message": bot_msg.message,
            "timestamp": bot_msg.timestamp
        }
    }
