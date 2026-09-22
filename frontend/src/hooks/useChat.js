import { useReducer, useCallback } from 'react'
import { analyzeMood, sendMessage } from '@/services/chatService'
import { MOODS } from '@/lib/classifier'

const WELCOME = {
  id: 'welcome', role: 'bot',
  text: "Hi — I'm MannMitra. Tell me how your day's been, in your own words. If it's ever too heavy to type, I'll point you to a person, not just a page.",
  mood: null, timestamp: new Date().toISOString(),
}

const init = { messages: [WELCOME], currentMood: 'neutral', isTyping: false, error: null }

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MSG':    return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_MOOD':   return { ...state, currentMood: action.payload }
    case 'SET_TYPING': return { ...state, isTyping: action.payload }
    case 'SET_ERROR':  return { ...state, error: action.payload }
    case 'CLEAR_ERR':  return { ...state, error: null }
    default: return state
  }
}

export function useChat(interests = [], speak = null) {
  const [state, dispatch] = useReducer(reducer, init)

  const handleSend = useCallback(async (text) => {
    if (!text?.trim()) return
    const userText = text.trim()
    dispatch({ type: 'ADD_MSG', payload: { id:`u_${Date.now()}`, role:'user', text:userText, timestamp:new Date().toISOString() } })
    dispatch({ type: 'SET_TYPING', payload: true })

    try {
      // Build conversation history for semantic context and Rogerian memory
      const history = state.messages
        .filter(m => m.role === 'user' || m.role === 'bot')
        .slice(-6)
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          text: m.text,
        }))

      const response = await sendMessage({
        message: userText,
        history,
        interests,
      })

      const { reply, mood, is_crisis, risk_level, activity } = response
      const resolvedMood = mood || 'neutral'
      dispatch({ type: 'SET_MOOD', payload: resolvedMood })

      if (is_crisis || resolvedMood === MOODS.CRISIS) {
        const crisisText = reply || "It sounds like things feel very heavy right now — more than any app should carry with you. Please reach out to a person right now."
        dispatch({ type: 'ADD_MSG', payload: {
          id: `crisis_${Date.now()}`,
          role: 'crisis',
          text: crisisText,
          mood: 'crisis',
          risk_level: risk_level || 'acute',
          timestamp: new Date().toISOString(),
        }})
        speak?.(crisisText)
        return
      }

      dispatch({ type: 'ADD_MSG', payload: {
        id: `b_${Date.now()}`,
        role: 'bot',
        text: reply,
        mood: resolvedMood,
        activity,
        timestamp: new Date().toISOString(),
      }})
      speak?.(reply)
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Something went wrong. Please try again.' })
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false })
    }
  }, [state.messages, interests, speak])

  return { messages: state.messages, currentMood: state.currentMood, isTyping: state.isTyping, error: state.error, handleSend }
}
