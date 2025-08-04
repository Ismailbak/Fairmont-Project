# Backend/routes/auth_routes.py

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from config.database import get_db
from controllers import auth
from config.jwt_config import refresh_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Request schemas
class SignUpRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/signup")
def signup(req: SignUpRequest, request: Request, db: Session = Depends(get_db)):
    return auth.signup_user(
        full_name=req.full_name,
        email=req.email,
        password=req.password,
        db=db,
        request=request
    )

@router.post("/signin")
def signin(req: SignInRequest, request: Request, db: Session = Depends(get_db)):
    return auth.signin_user(
        email=req.email,
        password=req.password,
        db=db,
        request=request
    )

@router.post("/refresh")
def refresh_token(req: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        new_access_token = refresh_access_token(req.refresh_token)
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to refresh token")

@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    """Logout user (invalidate session)"""
    # In a more sophisticated implementation, you might want to blacklist the token
    # For now, we'll just return a success message
    return {"message": "Logged out successfully"}
