import { useEffect, useRef } from 'react'
import MessageBubble from '../MessageBubble/MessageBubble'
import styles from './MessageList.module.css'

export default function MessageList({ messages, isTyping, onOpenActivity }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className={styles.log} role="log" aria-live="polite" aria-label="Chat messages">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} onOpenActivity={onOpenActivity} />
      ))}
      {isTyping && (
        <div className={styles.typingWrap}>
          <div className={styles.avatar} aria-hidden="true"><span>M</span></div>
          <div className={styles.typing} aria-label="MannMitra is typing">
            <span /><span /><span />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
