import { useEffect, useRef } from 'react'
import { moodGlow } from '@/lib/moodColors'
import styles from './Orb.module.css'

export default function Orb({ mood = 'neutral', size = 'large', className = '' }) {
  const orbRef = useRef(null)
  const glow = moodGlow[mood] || moodGlow.neutral

  useEffect(() => {
    const el = orbRef.current
    if (!el) return
    el.style.background = `radial-gradient(circle at 35% 30%, ${glow}, #0f111a 72%)`
    el.style.boxShadow  = `0 0 80px -12px ${glow}55, 0 0 40px -20px ${glow}88, inset 0 0 60px rgba(0,0,0,0.4)`
  }, [glow])

  return (
    <div className={`${styles.stage} ${styles[size]} ${className}`} aria-hidden="true">
      <div ref={orbRef} className={styles.orb} />
      <div className={styles.ring1} />
      <div className={styles.ring2} />
      <div className={styles.glow} style={{ background: `radial-gradient(circle, ${glow}1a, transparent 70%)` }} />
    </div>
  )
}
