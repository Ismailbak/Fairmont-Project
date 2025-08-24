from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from config.database import get_db
from middleware.auth_middleware import get_current_active_user
from models.chat_session import ChatSession
from models.user import User

router = APIRouter(prefix="/api/session", tags=["ChatSession"])

class ChatSessionCreateRequest(BaseModel):
    title: str

class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    class Config:
        from_attributes = True

@router.post("/new", response_model=ChatSessionResponse)
def create_session(req: ChatSessionCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    session = ChatSession(user_id=user.id, title=req.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/list", response_model=List[ChatSessionResponse])
def list_sessions(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    return db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(ChatSession.created_at.desc()).all()
