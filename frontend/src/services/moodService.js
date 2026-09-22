import api from './api'

export async function getMoodHistory(userId, days = 7) {
  try { return await api.get(`/api/mood/history/${userId}?days=${days}`) }
  catch { return [] }
}

export async function logMoodEvent(mood, sessionId) {
  try { await api.post('/api/mood/log', { mood, session_id: sessionId }) }
  catch { /* non-critical */ }
}
