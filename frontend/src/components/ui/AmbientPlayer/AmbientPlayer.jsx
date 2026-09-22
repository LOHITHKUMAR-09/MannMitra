import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './AmbientPlayer.module.css'

export const AMBIENT_TRACKS = [
  { id: 'nature',     title: 'Nature Ambience',  icon: '🌿', src: '/audio/nature.mp3' },
  { id: 'meditation', title: 'Deep Meditation',  icon: '🧘', src: '/audio/meditation.mp3' },
  { id: 'flute',      title: 'Krishna Flute',    icon: '🪈', src: '/audio/flute.mp3' },
]

/**
 * Checks if route should have ambient music muted by default
 * (chat and login/register pages)
 */
function shouldMuteByDefault(pathname) {
  return (
    pathname.startsWith('/chat') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  )
}

export default function AmbientPlayer() {
  const location = useLocation()
  const [currentTrackId, setCurrentTrackId] = useState('nature')
  const [isMuted, setIsMuted] = useState(() => shouldMuteByDefault(location.pathname))
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const prevPathRef = useRef(location.pathname)

  const currentTrack = AMBIENT_TRACKS.find(t => t.id === currentTrackId) || AMBIENT_TRACKS[0]

  // Initialize audio once
  useEffect(() => {
    const audio = new Audio(currentTrack.src)
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio

    const initiallyMuted = shouldMuteByDefault(location.pathname)
    audio.muted = initiallyMuted

    let hasInteracted = false

    const tryStart = () => {
      if (initiallyMuted) {
        setIsPlaying(false)
        setIsMuted(true)
        return
      }
      audio.play()
        .then(() => {
          setIsPlaying(true)
          setIsMuted(false)
        })
        .catch(() => {
          setIsPlaying(false)
          setIsMuted(true)
        })
    }

    tryStart()

    // Resume on user interaction if initial autoplay was blocked by browser
    const onUserInteraction = () => {
      if (hasInteracted) return
      hasInteracted = true
      if (audioRef.current && !audioRef.current.muted && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true)
            setIsMuted(false)
          })
          .catch(() => {})
      }
    }

    window.addEventListener('click', onUserInteraction, { passive: true })
    window.addEventListener('keydown', onUserInteraction, { passive: true })
    window.addEventListener('touchstart', onUserInteraction, { passive: true })

    return () => {
      window.removeEventListener('click', onUserInteraction)
      window.removeEventListener('keydown', onUserInteraction)
      window.removeEventListener('touchstart', onUserInteraction)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Handle route transitions (auto-mute in /chat and /login)
  useEffect(() => {
    const currentPath = location.pathname
    const prevPath = prevPathRef.current
    prevPathRef.current = currentPath

    if (currentPath === prevPath) return

    const audio = audioRef.current
    if (!audio) return

    if (shouldMuteByDefault(currentPath)) {
      // Entering chat or login/register -> mute by default
      audio.muted = true
      audio.pause()
      setIsMuted(true)
      setIsPlaying(false)
    } else if (shouldMuteByDefault(prevPath)) {
      // Navigating from chat/login to landing or info pages -> resume play if not explicitly muted
      audio.muted = false
      audio.play()
        .then(() => {
          setIsPlaying(true)
          setIsMuted(false)
        })
        .catch(() => {
          setIsMuted(true)
          setIsPlaying(false)
        })
    }
  }, [location.pathname])

  // Handle track changes
  const handleTrackChange = (newTrackId) => {
    setCurrentTrackId(newTrackId)
    const newTrack = AMBIENT_TRACKS.find(t => t.id === newTrackId) || AMBIENT_TRACKS[0]
    const audio = audioRef.current
    if (!audio) return

    audio.src = newTrack.src
    audio.load()

    // When explicitly changing track, unmute and play
    audio.muted = false
    setIsMuted(false)
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        setIsMuted(true)
        setIsPlaying(false)
      })
  }

  // Handle mute/unmute toggle
  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted || audio.paused) {
      audio.muted = false
      audio.play()
        .then(() => {
          setIsPlaying(true)
          setIsMuted(false)
        })
        .catch(() => {})
    } else {
      audio.muted = true
      audio.pause()
      setIsMuted(true)
      setIsPlaying(false)
    }
  }

  const isChat = location.pathname.startsWith('/chat')

  return (
    <div
      className={`${styles.soundController} ${isChat ? styles.chatPosition : ''} ${isMuted ? styles.soundMuted : styles.soundActive}`}
      role="region"
      aria-label="Ambient background music"
    >
      <div className={styles.trackSelectWrap}>
        <select
          className={styles.trackSelect}
          value={currentTrackId}
          onChange={e => handleTrackChange(e.target.value)}
          aria-label="Select background ambience track"
        >
          {AMBIENT_TRACKS.map(t => (
            <option key={t.id} value={t.id} className={styles.trackOption}>
              {t.icon} {t.title}
            </option>
          ))}
        </select>
        <span className={styles.selectArrow}>▾</span>
      </div>

      {!isMuted && isPlaying && (
        <span className={styles.soundWaves} title="Playing">
          <span /><span /><span />
        </span>
      )}

      <button
        type="button"
        className={styles.muteBtn}
        onClick={toggleMute}
        title={isMuted ? `Unmute ${currentTrack.title}` : `Mute ${currentTrack.title}`}
        aria-label={isMuted ? "Unmute ambience" : "Mute ambience"}
      >
        <span className={styles.muteIcon}>{isMuted ? '🔇' : '🔊'}</span>
        <span className={styles.muteText}>{isMuted ? 'Unmute' : 'Mute'}</span>
      </button>
    </div>
  )
}
