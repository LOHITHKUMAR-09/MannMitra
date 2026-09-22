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
    dispatch({ type: 'ADD_MSG', payload: { id:`u_${Date.now()}`, role:'user', text:text.trim(), timestamp:new Date().toISOString() } })
    dispatch({ type: 'SET_TYPING', payload: true })

    try {
      const history = state.messages.slice(-4).map(m => m.text)
      const { mood } = await analyzeMood(text, history)
      dispatch({ type: 'SET_MOOD', payload: mood })

      if (mood === MOODS.CRISIS) {
        dispatch({ type: 'ADD_MSG', payload: {
          id:`crisis_${Date.now()}`, role:'crisis',
          text:"It sounds like things feel very heavy right now — more than any app should carry with you. Please reach out to a person right now.",
          mood:'crisis', timestamp:new Date().toISOString()
        }})
        speak?.("It sounds like things feel very heavy right now. Please reach out to a person right now — helpline numbers are showing.")
        return
      }

      const { reply, activity } = await sendMessage(text, mood, interests, history)
      dispatch({ type: 'ADD_MSG', payload: { id:`b_${Date.now()}`, role:'bot', text:reply, mood, activity, timestamp:new Date().toISOString() } })
      speak?.(reply)
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Something went wrong. Please try again.' })
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false })
    }
  }, [state.messages, interests, speak])

  return { messages: state.messages, currentMood: state.currentMood, isTyping: state.isTyping, error: state.error, handleSend }
}
