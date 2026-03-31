from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest
from app.api.deps import get_db
import logging
import secrets
from datetime import datetime, timedelta
from app.core.config import FRONTEND_URL
from app.services.email_service import EmailService


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])

def generate_verification_token():
    return secrets.token_urlsafe(32)

def get_expiry():
    return datetime.utcnow() + timedelta(hours=24)

# -------------------- REGISTER --------------------
@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user.username).first()
    
    if existing:
        logger.warning(f"User registration failed: {user.username} already exists")
        raise HTTPException(status_code=400, detail="User already exists")

    verification_token = generate_verification_token()
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        email_verification_token = verification_token,
        token_expiry = get_expiry()
    )
    logger.info(f"Registering new user: {user.username}")

    db.add(new_user)
    db.commit()
    verification_link = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    email_service = EmailService()
    email_service.send_verification_email(to_email=user.email,verification_link = verification_link, user_name = user.username)
    return {"message": "verification link sent to your email"}


# -------------------- LOGIN --------------------
@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):        
        logger.warning(f"Login failed for user: {user.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Verify your email first")
    
    token = create_access_token(
        {"sub": db_user.username, "user_id": db_user.id}
    )
    logger.info(f"User logged in successfully: {user.username}")
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/verify-email")
def verify_email(token: str,db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email_verification_token=token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    if user.token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")

    user.is_verified = True
    user.email_verification_token = None
    db.commit()

    return {"message": "Email verified successfully"}