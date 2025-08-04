# Backend/routes/auth_routes.py

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from config.database import get_db
from controllers import auth

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Request schemas
class SignUpRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

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
