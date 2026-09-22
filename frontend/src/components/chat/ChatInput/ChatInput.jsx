import { useState, useRef } from 'react'
import styles from './ChatInput.module.css'

export default function ChatInput({ onSend, isListening, onMicClick, onSpeakToggle, voiceOutputOn, hasMic, hasSpeech }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.inputWrap}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tell me how you're feeling…"
          className={styles.input}
          aria-label="Chat message"
          autoComplete="off"
        />
        {hasMic && (
          <button
            className={`${styles.voiceBtn} ${isListening ? styles.listening : ''}`}
            onClick={() => onMicClick(text => setValue(text))}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            type="button"
          >
            {isListening ? '🔴' : '🎤'}
          </button>
        )}
      </div>
      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={!value.trim()}
        aria-label="Send message"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
      {hasSpeech && (
        <button
          className={`${styles.speakToggle} ${voiceOutputOn ? styles.speakOn : ''}`}
          onClick={onSpeakToggle}
          title={voiceOutputOn ? 'Disable voice output' : 'Enable voice output'}
          aria-label={voiceOutputOn ? 'Disable voice output' : 'Enable voice output'}
          type="button"
        >
          {voiceOutputOn ? '🔊' : '🔇'}
        </button>
      )}
    </div>
  )
}
