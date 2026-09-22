import { createContext, useContext, useState } from 'react'
import { INTERESTS } from '@/lib/constants'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [interests, setInterests] = useState(
    INTERESTS.filter(i => i.defaultChecked).map(i => i.id)
  )
  const [openActivity, setOpenActivity] = useState(null)

  const toggleInterest = (id) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <ChatContext.Provider value={{ interests, toggleInterest, openActivity, setOpenActivity }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be within ChatProvider')
  return ctx
}
