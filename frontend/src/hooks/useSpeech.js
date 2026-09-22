import { useState, useCallback, useRef } from 'react'

export function useSpeech() {
  const [voiceOutputOn, setVoiceOutputOn] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const SR = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null

  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window
  const hasSpeechRecognition = !!SR

  const speak = useCallback((text) => {
    if (!voiceOutputOn || !hasSpeechSynthesis) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95; u.pitch = 1.0; u.volume = 0.9
      window.speechSynthesis.speak(u)
    } catch { /* fail silently */ }
  }, [voiceOutputOn, hasSpeechSynthesis])

  const toggleVoiceOutput = useCallback(() => setVoiceOutputOn(p => !p), [])

  const startListening = useCallback((onResult) => {
    if (!SR) return false
    if (isListening) { recognitionRef.current?.stop(); return }
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1
    r.onstart = () => setIsListening(true)
    r.onend   = () => setIsListening(false)
    r.onerror = () => setIsListening(false)
    r.onresult = (e) => onResult?.(e.results[0][0].transcript)
    recognitionRef.current = r
    r.start()
    return true
  }, [SR, isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop(); setIsListening(false)
  }, [])

  return { speak, voiceOutputOn, toggleVoiceOutput, isListening, startListening, stopListening, hasSpeechSynthesis, hasSpeechRecognition }
}
