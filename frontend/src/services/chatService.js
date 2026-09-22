/**
 * Chat service — tries FastAPI backend, gracefully falls back to local
 * Backend endpoints (FastAPI):
 *   POST /api/mood/classify   → { mood, confidence }
 *   POST /api/chat/message    → { reply, mood, activity }
 *   POST /api/session/save    → { ok }
 */
import api from './api'
import { classify } from '@/lib/classifier'
import { botReplies, activityMap } from '@/lib/moodColors'

export async function analyzeMood(text, history = []) {
  try {
    const data = await api.post('/api/mood/classify', { text, history })
    return { mood: data.mood, confidence: data.confidence ?? 1.0 }
  } catch {
    return { mood: classify(text), confidence: null }
  }
}

export async function sendMessage(text, mood, interests = [], history = []) {
  try {
    return await api.post('/api/chat/message', { text, mood, interests, history })
  } catch {
    const reply = botReplies[mood] || botReplies.neutral
    const canSuggest = mood !== 'happy' && mood !== 'neutral' && mood !== 'crisis' && interests.length > 0
    let activity = null
    if (canSuggest) {
      const interest = interests[0]
      if (activityMap[interest]) activity = { interest, ...activityMap[interest] }
    }
    return { reply, mood, activity }
  }
}

export async function saveSession(messages) {
  try {
    await api.post('/api/session/save', { messages })
    return true
  } catch { return false }
}
