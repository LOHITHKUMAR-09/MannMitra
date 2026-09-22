/**
 * MannMitra — Axios API client
 * Proxied by Vite → FastAPI on localhost:8000
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mannmitra_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (err) => Promise.reject(err))

// Global error handling
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mannmitra_token')
    }
    return Promise.reject(err.response?.data || err.message)
  }
)

export default api
