from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class MessageItem(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: List[MessageItem] = []
    interests: List[str] = []


class ActivitySuggestion(BaseModel):
    key: str
    label: str
    icon: str
    description: str
    interest: str


class ChatResponse(BaseModel):
    reply: str
    mood: str
    is_crisis: bool
    risk_level: str
    activity: Optional[ActivitySuggestion] = None
    engine: str


class MoodClassifyRequest(BaseModel):
    text: str
    history: List[str] = []


class MoodClassifyResponse(BaseModel):
    mood: str
    confidence: float
    is_crisis: bool
    risk_level: str
    rationale: Optional[str] = None
    engine: str
