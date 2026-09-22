/**
 * MannMitra — Chat service
 * Consumes FastAPI semantic affect & 1-on-1 Groq companion endpoints:
 *   POST /api/chat/message    → { reply, mood, is_crisis, risk_level, activity, engine }
 *   POST /api/mood/classify   → { mood, confidence, is_crisis, risk_level, rationale, engine }
 *   GET  /api/chat/status     → { status, llm_provider, model, api_key_configured, mode }
 *   POST /api/session/save    → { ok }
 */
import api from './api'
import { classify, MOODS } from '@/lib/classifier'
import { botReplies, activityMap } from '@/lib/moodColors'

export async function analyzeMood(text, history = []) {
  try {
    const formattedHistory = Array.isArray(history)
      ? history.map(item => typeof item === 'string' ? item : item.text || '')
      : []
    const data = await api.post('/api/mood/classify', { text, history: formattedHistory })
    return {
      mood: data.mood,
      confidence: data.confidence ?? 1.0,
      is_crisis: Boolean(data.is_crisis),
      risk_level: data.risk_level ?? 'none',
      rationale: data.rationale ?? null,
      engine: data.engine ?? 'semantic',
    }
  } catch {
    const localMood = classify(text)
    const isCrisis = localMood === MOODS.CRISIS
    return {
      mood: localMood,
      confidence: null,
      is_crisis: isCrisis,
      risk_level: isCrisis ? 'acute' : 'none',
      rationale: 'Local heuristic fallback',
      engine: 'local-lexicon',
    }
  }
}

export async function sendMessage(arg1, arg2, arg3 = [], arg4 = []) {
  let message = ''
  let history = []
  let interests = []

  if (typeof arg1 === 'object' && arg1 !== null && ('message' in arg1 || 'text' in arg1)) {
    message = arg1.message || arg1.text || ''
    history = arg1.history || []
    interests = arg1.interests || []
  } else {
    message = typeof arg1 === 'string' ? arg1 : ''
    interests = Array.isArray(arg3) ? arg3 : []
    if (Array.isArray(arg4)) {
      history = arg4.map(item => (typeof item === 'string' ? { role: 'user', text: item } : item))
    }
  }

  // Ensure history items match { role: 'user'|'assistant', text: string }
  const cleanHistory = history.map(m => ({
    role: m.role === 'assistant' || m.role === 'bot' ? 'assistant' : 'user',
    text: m.text || m.content || '',
  }))

  try {
    return await api.post('/api/chat/message', {
      message,
      history: cleanHistory,
      interests,
    })
  } catch {
    // Intelligent offline client fallback
    const mood = classify(message)
    const is_crisis = mood === MOODS.CRISIS
    let reply
    if (is_crisis) {
      reply = "It sounds like things feel very heavy right now — more than any app should carry with you. Please reach out to a person right now."
    } else {
      reply = botReplies[mood] || botReplies.neutral
    }

    let activity = null
    if (!is_crisis && mood !== 'happy' && mood !== 'neutral' && interests.length > 0) {
      const interest = interests[0]
      if (activityMap[interest]) {
        activity = { interest, ...activityMap[interest] }
      }
    }

    return {
      reply,
      mood,
      is_crisis,
      risk_level: is_crisis ? 'acute' : 'none',
      activity,
      engine: 'local-fallback',
    }
  }
}

export async function getChatEngineStatus() {
  try {
    return await api.get('/api/chat/status')
  } catch {
    return {
      status: 'offline',
      llm_provider: 'Groq',
      model: 'llama-3.3-70b-versatile',
      api_key_configured: false,
      mode: 'Local Client Fallback',
    }
  }
}

export async function saveSession(messages) {
  try {
    await api.post('/api/session/save', { messages })
    return true
  } catch {
    return false
  }
}

