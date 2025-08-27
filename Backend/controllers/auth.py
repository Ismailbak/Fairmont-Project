# Backend/controllers/auth.py

from fastapi import HTTPException, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime
from models.user import User
from models.user_activity import UserActivity
from config.database import get_db
from config.jwt_config import create_access_token, create_refresh_token
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helper to hash password
def hash_password(password: str):
    return pwd_context.hash(password)

# Helper to verify password
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Helper to log user activity
def log_user_activity(user_id: int, action: str, db: Session, request: Request = None, details: str = None):
    activity = UserActivity(
        user_id=user_id,
        action=action,
        endpoint=request.url.path if request else None,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
        details=details
    )
    db.add(activity)
    db.commit()

# Signup logic
def signup_user(full_name: str, email: str, password: str, db: Session, request: Request = None):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=full_name,
        email=email,
        hashed_password=hash_password(password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log signup activity
    log_user_activity(new_user.id, "signup", db, request)
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    return {
        "message": "User created successfully",
        "user_id": new_user.id,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# Signin logic
def signin_user(email: str, password: str, db: Session, request: Request = None):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Log signin activity
    log_user_activity(user.id, "signin", db, request)
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "message": "Login successful",
        "user_id": user.id,
        "full_name": user.full_name,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# Reset password logic
def reset_password(email: str, new_password: str, db: Session, request: Request = None):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.hashed_password = hash_password(new_password)
    db.commit()
    
    # Log password reset activity
    log_user_activity(user.id, "password_reset", db, request)
    
    return {
        "message": "Password reset successfully",
        "user_id": user.id
    }
