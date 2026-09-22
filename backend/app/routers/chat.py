"""
app/routers/chat.py — Semantic Affect & 1-on-1 Companion Chat Router
"""
from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    MoodClassifyRequest,
    MoodClassifyResponse,
    MessageItem,
)
from app.services.ai_chat import evaluate_safety_and_mood, generate_companion_reply
from app.config import get_settings

router = APIRouter(prefix="/api", tags=["chat"])
settings = get_settings()


@router.post("/chat/message", response_model=ChatResponse)
async def chat_message(req: ChatRequest):
    """
    Main 1-on-1 conversation endpoint:
    1. Semantically evaluates message for implicit/explicit crisis and affect.
    2. Generates empathetic Rogerian response via Groq LLaMA 3.3 70B (or fallback).
    3. Seamlessly suggests personalized activities when helpful.
    """
    safety = await evaluate_safety_and_mood(req.message, req.history)
    mood = safety.get("mood", "neutral")
    is_crisis = safety.get("is_crisis", False)
    risk_level = safety.get("risk_level", "none")

    companion = await generate_companion_reply(
        message=req.message,
        mood=mood,
        is_crisis=is_crisis,
        history=req.history,
        interests=req.interests,
    )

    return ChatResponse(
        reply=companion["reply"],
        mood=mood,
        is_crisis=is_crisis,
        risk_level=risk_level,
        activity=companion.get("activity"),
        engine=companion.get("engine", "semantic"),
    )


@router.post("/mood/classify", response_model=MoodClassifyResponse)
async def classify_mood(req: MoodClassifyRequest):
    """
    Semantic affect and crisis classification endpoint.
    Identifies implicit distress without requiring exact keyword syntax.
    """
    history_items = [MessageItem(role="user", text=t) for t in req.history]
    eval_res = await evaluate_safety_and_mood(req.text, history_items)

    return MoodClassifyResponse(
        mood=eval_res.get("mood", "neutral"),
        confidence=float(eval_res.get("confidence", 0.85)),
        is_crisis=eval_res.get("is_crisis", False),
        risk_level=eval_res.get("risk_level", "none"),
        rationale=eval_res.get("rationale"),
        engine=eval_res.get("engine", "semantic"),
    )


@router.get("/chat/status")
def chat_engine_status():
    """
    Returns the currently active AI inference engine configuration.
    """
    has_key = bool(settings.groq_api_key.strip())
    return {
        "status": "ready",
        "llm_provider": "Groq",
        "model": settings.groq_model,
        "api_key_configured": has_key,
        "mode": "Groq LLaMA 3.3 70B Live" if has_key else "Intelligent Semantic Fallback (Awaiting GROQ_API_KEY)",
    }
