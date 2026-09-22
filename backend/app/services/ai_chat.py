"""
app/services/ai_chat.py — Semantic Crisis Detection & 1-on-1 Human Companion Engine
Powered by Groq LLM with intelligent semantic fallback.
"""
import json
import httpx
from typing import List, Dict, Any, Optional
from app.config import get_settings
from app.schemas.chat import MessageItem, ActivitySuggestion

settings = get_settings()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

ACTIVITY_CATALOG = {
    "painting": {
        "key": "canvas",
        "label": "Open the Canvas",
        "icon": "🎨",
        "description": "Express what you're holding with color and shape",
        "interest": "painting",
    },
    "music": {
        "key": "music",
        "label": "Play some Notes",
        "icon": "🎵",
        "description": "A pentatonic pad where any note combination sounds peaceful",
        "interest": "music",
    },
    "gaming": {
        "key": "game",
        "label": "Play Memory Game",
        "icon": "🎮",
        "description": "A gentle distraction to reset mental focus",
        "interest": "gaming",
    },
    "writing": {
        "key": "journal",
        "label": "Open the Journal",
        "icon": "📖",
        "description": "Write without judgment — stays only on your device",
        "interest": "writing",
    },
    "nature": {
        "key": "breathing",
        "label": "Box Breathing",
        "icon": "🌿",
        "description": "Settle your heart rate and parasympathetic nervous system",
        "interest": "nature",
    },
}

SAFETY_SYSTEM_PROMPT = """
You are an expert clinical psychologist and natural language safety evaluator for a mental health support companion named MannMitra.
Your task is to analyze the user's message in the context of recent turns for implicit and explicit emotional state and crisis cues.

CRISIS EVALUATION RULES (WITHOUT relying solely on exact keywords):
1. Detect implicit indicators of severe distress:
   - Perceived burdensomeness (e.g. "they'd be better off without me", "I'm just dragging everyone down")
   - Thwarted belongingness / profound isolation ("nobody would care if I wasn't here")
   - Preparatory acts / implicit farewells ("giving away my things", "thank you for everything, this is goodbye", "I won't be waking up")
   - Emotional exhaustion / existential collapse ("I can't carry this anymore", "I want everything to stop")
   - Direct suicidal or self-harm intent
2. Distinguish colloquial hyperbole from genuine risk:
   - "This exam is killing me" = STRESSED (NOT crisis)
   - "I'm dying of laughter" = HAPPY (NOT crisis)
3. Classify mood into one of: 'happy', 'sad', 'anxious', 'angry', 'stressed', 'neutral', 'crisis'.

CRITICAL: Return ONLY valid JSON in this exact structure, with no markdown code fences:
{
  "is_crisis": true/false,
  "risk_level": "none" | "low" | "moderate" | "acute",
  "mood": "happy" | "sad" | "anxious" | "angry" | "stressed" | "neutral" | "crisis",
  "confidence": 0.0 to 1.0,
  "rationale": "one sentence explaining the emotional subtext detected"
}
"""

COMPANION_SYSTEM_PROMPT = """
You are MannMitra ("Friend of the Mind/Heart"), a warm, compassionate, authentic 1-on-1 mental health companion for students.
You are having a real, personal conversation with someone who needs an understanding ear.

CORE PRINCIPLES:
1. Rogerian Reflective Listening: Always validate and mirror their emotions FIRST before offering suggestions or asking questions. Let them feel truly heard.
2. Authentic & Grounded: Speak naturally like a deeply caring, emotionally intelligent human friend. Never use clinical jargon, robotic disclaimers, or corporate phrasing.
3. Natural Pacing: Keep responses concise and readable (2 to 4 sentences maximum). Do not overwhelm the user with long walls of text or bullet points.
4. Memory & Continuity: Use the previous turns naturally to reference what they've already shared without making them repeat themselves.
5. Soft Activity Bridges: If the user is feeling sad, anxious, or overwhelmed, and an activity is suggested, invite them gently into it as a comforting gesture, never as a clinical prescription.

CRISIS PROTOCOL (When user is in crisis):
- Do NOT scold, argue, or present a cold sterile error box.
- Respond with deep tenderness and warmth: acknowledge how overwhelmingly heavy things feel, validate that their pain is real, remind them they do not have to carry this alone, and gently bridge to human care.
"""


def _semantic_fallback_evaluation(text: str) -> Dict[str, Any]:
    """
    Intelligent heuristic fallback when LLM API key is not configured.
    Detects implicit crisis phrases and affect with context-awareness.
    """
    t = " " + text.lower() + " "

    crisis_patterns = [
        "suicide", "kill myself", "want to die", "end it all", "end my life",
        "better off dead", "no reason to live", "wish i was dead", "not worth living",
        "take my own life", "hurt myself", "self harm", "goodbye everyone",
        "won't be here tomorrow", "giving away my", "can't go on anymore",
        "everyone would be better without me", "i am a burden", "rather be dead"
    ]

    is_hyperbole = any(h in t for h in ["killing me with laughter", "dying of laughter", "dead tired"])
    is_crisis = any(p in t for p in crisis_patterns) and not is_hyperbole

    if is_crisis:
        return {
            "is_crisis": True,
            "risk_level": "acute",
            "mood": "crisis",
            "confidence": 0.95,
            "rationale": "High-urgency distress or existential crisis cue detected in message.",
            "engine": "fallback-semantic",
        }

    # Mood scoring
    lex = {
        "happy": ["happy", "great", "good", "excited", "grateful", "amazing", "peaceful", "proud", "relieved", "joy", "cheerful", "glad", "content"],
        "sad": ["sad", "down", "depressed", "lonely", "empty", "hopeless", "crying", "heartbroken", "numb", "unhappy", "isolated", "alone", "crying", "lost", "gloomy", "miserable"],
        "anxious": ["anxious", "nervous", "worried", "scared", "panic", "overwhelmed", "racing", "dread", "tense", "fear", "restless", "uneasy", "frightened", "jitters"],
        "angry": ["angry", "mad", "furious", "frustrated", "annoyed", "irritated", "hate", "unfair", "bitter", "enraged", "pissed", "hostile", "resentful"],
        "stressed": ["stressed", "pressure", "exhausted", "burnt out", "burnout", "deadline", "deadlines", "swamped", "drained", "homework", "exam", "exams", "overloaded", "assignment", "assignments"],
    }

    scores = {m: sum(1 for w in words if w in t) for m, words in lex.items()}
    best_mood = max(scores, key=scores.get)
    best_score = scores[best_mood]

    mood = best_mood if best_score > 0 else "neutral"

    return {
        "is_crisis": False,
        "risk_level": "none",
        "mood": mood,
        "confidence": 0.85 if best_score > 0 else 0.6,
        "rationale": f"Detected predominant emotion as {mood} based on contextual cues.",
        "engine": "fallback-semantic",
    }


async def evaluate_safety_and_mood(
    message: str,
    history: List[MessageItem],
) -> Dict[str, Any]:
    """
    Evaluates message for semantic crisis signals and affect using Groq LLM (with fallback).
    """
    api_key = settings.groq_api_key.strip()
    if not api_key:
        return _semantic_fallback_evaluation(message)

    recent_history = [
        {"role": "user" if m.role == "user" else "assistant", "content": m.text}
        for m in history[-4:]
    ]

    messages = [
        {"role": "system", "content": SAFETY_SYSTEM_PROMPT},
        *recent_history,
        {"role": "user", "content": f"Analyze this message: \"{message}\""},
    ]

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.groq_model,
                    "messages": messages,
                    "temperature": 0.1,
                    "max_tokens": 160,
                    "response_format": {"type": "json_object"},
                },
            )

        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            parsed["engine"] = f"groq-{settings.groq_model}"
            return parsed
    except Exception:
        pass

    return _semantic_fallback_evaluation(message)


async def generate_companion_reply(
    message: str,
    mood: str,
    is_crisis: bool,
    history: List[MessageItem],
    interests: List[str],
) -> Dict[str, Any]:
    """
    Generates authentic, 1-on-1 human-like response from MannMitra using Groq.
    """
    api_key = settings.groq_api_key.strip()

    # Determine potential activity
    suggested_activity = None
    can_suggest_activity = (
        not is_crisis
        and mood in ["sad", "anxious", "angry", "stressed"]
        and len(interests) > 0
    )
    if can_suggest_activity:
        interest = interests[0]
        if interest in ACTIVITY_CATALOG:
            suggested_activity = ActivitySuggestion(**ACTIVITY_CATALOG[interest])

    if not api_key:
        # High-quality contextual fallback replies
        fallback_replies = {
            "happy": "That is so genuinely lovely to hear. Take a moment to really soak in that feeling — you deserve it.",
            "sad": "I hear how heavy that feels right now. Thank you for trusting me with it. Take your time — I'm right here with you.",
            "anxious": "It sounds like thoughts are spinning fast and everything feels loud. Breathe with me for a second. You don't have to solve it all right this minute.",
            "angry": "That frustration makes complete sense. When things feel unfair or push you past your limit, it's exhausting.",
            "stressed": "You are carrying a very real amount of pressure right now. It makes complete sense that you feel drained.",
            "neutral": "Thank you for sharing that with me. I'm right here listening — tell me more whenever you'd like.",
            "crisis": "I hear how completely exhausted and overwhelmed you are right now. Your pain is real, but you do not have to carry this completely alone. Please reach out to someone who can hear your voice.",
        }
        return {
            "reply": fallback_replies.get(mood, fallback_replies["neutral"]),
            "activity": suggested_activity,
            "engine": "fallback-semantic",
        }

    # Format history for LLM
    formatted_history = []
    for m in history[-6:]:
        role = "user" if m.role == "user" else "assistant"
        formatted_history.append({"role": role, "content": m.text})

    activity_context = ""
    if suggested_activity:
        activity_context = f"\nThe user enjoys {suggested_activity.interest}. At the end of your response, you may gently offer: '{suggested_activity.label} ({suggested_activity.description})' as a calm invitation."

    system_instruction = (
        COMPANION_SYSTEM_PROMPT
        + f"\nDetected current emotional state: {mood.upper()} (Crisis: {is_crisis})."
        + activity_context
    )

    messages = [
        {"role": "system", "content": system_instruction},
        *formatted_history,
        {"role": "user", "content": message},
    ]

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.groq_model,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 220,
                },
            )

        if resp.status_code == 200:
            reply_text = resp.json()["choices"][0]["message"]["content"].strip()
            return {
                "reply": reply_text,
                "activity": suggested_activity,
                "engine": f"groq-{settings.groq_model}",
            }
    except Exception:
        pass

    return {
        "reply": "I'm listening and I'm right here with you. Tell me what's on your mind.",
        "activity": suggested_activity,
        "engine": "fallback-semantic",
    }
