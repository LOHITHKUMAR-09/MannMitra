import { useState, useCallback, useRef } from 'react'

export function useSpeech() {
  const [voiceOutputOn, setVoiceOutputOn] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const recognitionRef = useRef(null)

  const SR = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null

  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window
  const hasSpeechRecognition = !!SR

  const stopSpeaking = useCallback(() => {
    if (!hasSpeechSynthesis) return
    try {
      window.speechSynthesis.cancel()
    } catch {}
    setSpeakingId(null)
  }, [hasSpeechSynthesis])

  const speakDirect = useCallback((id, text) => {
    if (!hasSpeechSynthesis) return
    if (speakingId === id) {
      stopSpeaking()
      return
    }
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95
      u.pitch = 1.0
      u.volume = 0.9
      u.onend = () => setSpeakingId(null)
      u.onerror = () => setSpeakingId(null)
      setSpeakingId(id)
      window.speechSynthesis.speak(u)
    } catch {
      setSpeakingId(null)
    }
  }, [hasSpeechSynthesis, speakingId, stopSpeaking])

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
    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
      return false
    }
    try {
      const r = new SR()
      r.lang = 'en-US'
      r.interimResults = false
      r.maxAlternatives = 1
      r.onstart = () => setIsListening(true)
      r.onend   = () => setIsListening(false)
      r.onerror = () => setIsListening(false)
      r.onresult = (e) => {
        const transcript = e.results?.[0]?.[0]?.transcript
        if (transcript) onResult?.(transcript)
      }
      recognitionRef.current = r
      r.start()
      return true
    } catch {
      setIsListening(false)
      return false
    }
  }, [SR, isListening])

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop() } catch {}
    setIsListening(false)
  }, [])

  return {
    speak,
    speakDirect,
    stopSpeaking,
    speakingId,
    voiceOutputOn,
    toggleVoiceOutput,
    isListening,
    startListening,
    stopListening,
    hasSpeechSynthesis,
    hasSpeechRecognition
  }
}
