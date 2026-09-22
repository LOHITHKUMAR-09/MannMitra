"""
app/routers/auth.py — Authentication endpoints

POST /api/auth/register  — create a new user, returns JWT
POST /api/auth/login     — verify credentials, returns JWT
GET  /api/auth/me        — return the logged-in user's profile (requires token)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, UserPublic
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Register ──────────────────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new MannMitra account",
)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Reject duplicate emails
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=body.email,
        display_name=body.display_name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


# ── Login ─────────────────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Sign in and receive a JWT",
)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    # Use constant-time comparison to avoid timing attacks
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact support.",
        )

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


# ── Get current user ──────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserPublic,
    summary="Return the authenticated user's profile",
)
def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic.model_validate(current_user)
