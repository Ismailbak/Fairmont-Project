# Backend/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from config.database import get_db
from middleware.auth_middleware import get_current_active_user
from models.user import User
from models.user_activity import UserActivity

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Response models
class UserActivityResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    action: str
    endpoint: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    timestamp: datetime
    details: Optional[str]

    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    created_at: datetime
    last_login: Optional[datetime]
    total_activities: int
    recent_activities: List[str]

class UserDetailsResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    hashed_password: str
    created_at: datetime
    last_login: Optional[datetime]
    is_active: bool
    is_admin: bool

@router.get("/user-activities", response_model=List[UserActivityResponse])
def get_user_activities(
    limit: int = 50,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user activities for monitoring (requires authentication)"""
    query = db.query(UserActivity).join(User)
    
    if user_id:
        query = query.filter(UserActivity.user_id == user_id)
    
    activities = query.order_by(desc(UserActivity.timestamp)).limit(limit).all()
    
    result = []
    for activity in activities:
        result.append(UserActivityResponse(
            id=activity.id,
            user_id=activity.user_id,
            user_name=activity.user.full_name,
            action=activity.action,
            endpoint=activity.endpoint,
            ip_address=activity.ip_address,
            user_agent=activity.user_agent,
            timestamp=activity.timestamp,
            details=activity.details
        ))
    
    return result

@router.get("/user-stats", response_model=List[UserStatsResponse])
def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user statistics for monitoring"""
    users = db.query(User).all()
    
    result = []
    for user in users:
        activities = db.query(UserActivity).filter(UserActivity.user_id == user.id).all()
        recent_activities = [a.action for a in activities[-5:]]  # Last 5 activities
        
        result.append(UserStatsResponse(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            created_at=user.created_at,
            last_login=user.last_login,
            total_activities=len(activities),
            recent_activities=recent_activities
        ))
    
    return result

@router.get("/user-details", response_model=List[UserDetailsResponse])
def get_user_details(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get detailed user information including passwords (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).all()
    
    result = []
    for user in users:
        result.append(UserDetailsResponse(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            hashed_password=user.hashed_password,
            created_at=user.created_at,
            last_login=user.last_login,
            is_active=user.is_active,
            is_admin=user.is_admin
        ))
    
    return result

@router.get("/my-activities", response_model=List[UserActivityResponse])
def get_my_activities(
    limit: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's own activities"""
    activities = db.query(UserActivity).filter(
        UserActivity.user_id == current_user.id
    ).order_by(desc(UserActivity.timestamp)).limit(limit).all()
    
    result = []
    for activity in activities:
        result.append(UserActivityResponse(
            id=activity.id,
            user_id=activity.user_id,
            user_name=current_user.full_name,
            action=activity.action,
            endpoint=activity.endpoint,
            ip_address=activity.ip_address,
            user_agent=activity.user_agent,
            timestamp=activity.timestamp,
            details=activity.details
        ))
    
    return result
