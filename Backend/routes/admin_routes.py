# Backend/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

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
    is_admin: bool

class AdminVerificationResponse(BaseModel):
    is_admin: bool
    user_id: int
    full_name: str
    email: str

# Helper function to check admin privileges
def get_current_admin_user(current_user: User = Depends(get_current_active_user)):
    """Get current user and verify admin privileges"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/verify-admin", response_model=AdminVerificationResponse)
def verify_admin_access(current_user: User = Depends(get_current_active_user)):
    """Verify if the current user has admin privileges"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    
    return AdminVerificationResponse(
        is_admin=True,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email
    )

@router.get("/user-activities", response_model=List[UserActivityResponse])
def get_user_activities(
    limit: int = 50,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get user activities for monitoring (requires admin authentication)"""
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
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get user statistics for monitoring (requires admin authentication)"""
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
            recent_activities=recent_activities,
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

@router.get("/dashboard-stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics"""
    total_users = db.query(User).count()
    total_activities = db.query(UserActivity).count()
    
    # Get active users (logged in within last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.query(User).filter(User.last_login >= thirty_days_ago).count()
    
    # Get recent activities (last 24 hours)
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    recent_activities = db.query(UserActivity).filter(
        UserActivity.timestamp >= twenty_four_hours_ago
    ).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_activities": total_activities,
        "recent_activities_24h": recent_activities
    }
