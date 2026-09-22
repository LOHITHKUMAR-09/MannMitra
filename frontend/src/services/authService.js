/**
 * Auth service — JWT via FastAPI
 * Endpoints: POST /api/auth/login, /register, GET /api/auth/me
 */
import api from './api'

export async function login(email, password) {
  const data = await api.post('/api/auth/login', { email, password })
  if (data.access_token) localStorage.setItem('mannmitra_token', data.access_token)
  return data
}

export async function register(email, password, displayName) {
  return api.post('/api/auth/register', { email, password, display_name: displayName })
}

export async function logout() {
  localStorage.removeItem('mannmitra_token')
}

export async function getMe() {
  return api.get('/api/auth/me')
}

export function isAuthenticated() {
  return !!localStorage.getItem('mannmitra_token')
}
