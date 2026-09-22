"""
app/schemas/user.py — Pydantic v2 request / response models
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ── Request bodies ────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Response models ───────────────────────────────────────────

class UserPublic(BaseModel):
    """Safe user fields returned to the client — never include hashed_password."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
