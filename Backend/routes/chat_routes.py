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
    try:
        # Validate session_id
        if not session_id or session_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid session ID")
            
        # Check if session exists and belongs to the current user
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or you don't have permission to access it")
            
        # Get messages with error handling
        messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp).all()
        return messages
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error retrieving session messages: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while retrieving messages")

# Add a new chat message

# Clear response cache (admin only)
@router.post("/clear-cache")
def clear_response_cache(user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Clear the cached responses (admin only)"""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from controllers.chat import _RESPONSE_CACHE, _CACHE_LOCK
    with _CACHE_LOCK:
        _RESPONSE_CACHE.clear()
    
    return {"success": True, "message": "Response cache cleared successfully"}

# Add a new chat message and generate bot reply
@router.post("/message")
def add_chat_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user)
):
    try:
        # Additional validation
        if not req.message or not req.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
            
        if not req.sender in ['user', 'bot']:
            raise HTTPException(status_code=400, detail="Invalid sender. Must be 'user' or 'bot'")
        
        # Validate session with better error handling
        session = db.query(ChatSession).filter(ChatSession.id == req.session_id, ChatSession.user_id == user.id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or access denied")
        
        # We'll always use the AI response handler which will manage context properly
        # No need to short-circuit with direct context responses
        
        # Otherwise continue with regular flow for more complex questions
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
    except Exception as e:
        # Log the error
        print(f"Error processing message: {str(e)}")
        # Rollback the transaction if an error occurs
        db.rollback()
        # Provide a more helpful error message
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing your message: {str(e)}"
        )