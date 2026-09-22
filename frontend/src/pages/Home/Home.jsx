import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Orb from '@/components/ui/Orb/Orb'
import Eyebrow from '@/components/ui/Eyebrow/Eyebrow'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import Button from '@/components/ui/Button/Button'
import { HERO_MOODS } from '@/lib/constants'
import styles from './Home.module.css'

const PILLARS = [
  { num:'01', title:'Sense',   desc:'Classify affect from free text as the student types, turn by turn.' },
  { num:'02', title:'Respond', desc:"If the mood isn't happy/content, match one activity to their stated interests." },
  { num:'03', title:'Deliver', desc:'Open that activity inline — canvas, game, music, journal, breathing — no new tab.' },
  { num:'04', title:'Protect', desc:'On crisis language, drop everything else and route to a human immediately.' },
]

const FEATURES = [
  { icon:'🎨', title:'Canvas Painting', desc:'Express emotions through freeform painting with a curated palette.' },
  { icon:'🎵', title:'Music Pad',        desc:'A pentatonic scale where every note combination sounds pleasant.' },
  { icon:'🎮', title:'Memory Game',      desc:'A gentle focus exercise to redirect anxious or sad energy.' },
  { icon:'📖', title:'Guided Journal',   desc:'Reflective writing prompts grounded in cognitive psychology.' },
  { icon:'🌿', title:'Breathing',        desc:'Box-breathing cycles to activate the parasympathetic system.' },
  { icon:'🆘', title:'Crisis Safety',    desc:'Detects crisis language and routes immediately to a human.' },
]

export default function Home() {
  const [moodIdx, setMoodIdx] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const mood = ['happy','sad','anxious','angry','stressed','neutral'][moodIdx % 6]

  useEffect(() => {
    const t = setInterval(() => setMoodIdx(i => i + 1), 3400)
    return () => clearInterval(t)
  }, [])

  // Background nature music — exclusively active on the landing page
  useEffect(() => {
    const audio = new Audio('/audio/nature.mp3')
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio

    let interacted = false

    const startAudio = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true)
          setIsMuted(false)
        })
        .catch(() => {
          // Browser requires user interaction before autoplay
          setIsPlaying(false)
          setIsMuted(true)
        })
    }

    startAudio()

    const onUserInteract = () => {
      if (interacted) return
      interacted = true
      if (audio.paused && !audio.muted) {
        audio.play()
          .then(() => {
            setIsPlaying(true)
            setIsMuted(false)
          })
          .catch(() => {})
      }
    }

    window.addEventListener('click', onUserInteract, { passive: true })
    window.addEventListener('keydown', onUserInteract, { passive: true })
    window.addEventListener('touchstart', onUserInteract, { passive: true })

    // Clean up when leaving landing page: stop audio completely
    return () => {
      window.removeEventListener('click', onUserInteract)
      window.removeEventListener('keydown', onUserInteract)
      window.removeEventListener('touchstart', onUserInteract)
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [])

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
      setIsMuted(true)
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} wrap-wide`}>
          <div className={styles.heroText}>
            <Eyebrow>Cognitive Psychology · Companion Systems</Eyebrow>
            <h1 className={styles.heroTitle}>
              An affect-aware companion that notices when you're{' '}
              <em className={styles.accent}>not</em> okay.
            </h1>
            <p className={styles.heroSub}>
              MannMitra — from the Hindi/Sanskrit <em>mann</em> (mind, heart) and{' '}
              <em>mitra</em> (friend) — reads emotional tone from what a student types
              and offers one small, personally relevant activity to shift the mood.
              If words point to real danger, it stops and points to a human instead.
            </p>
            <div className={styles.ctaRow}>
              <Button variant="solid" size="lg" as={Link} to="/login">
                Talk now ↗
              </Button>
              <Button variant="ghost" size="lg" as={Link} to="/about">
                Read the theory
              </Button>
            </div>
            <div className={styles.meta}>
              {[['Field','Cognitive & Affective Psychology'],['Deliverable','Working prototype + evaluation plan'],['Status','Text + voice live · VR proposed']].map(([k,v]) => (
                <div key={k} className={styles.metaItem}>
                  <span className={styles.metaKey}>{k}</span>
                  <strong className={styles.metaVal}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroOrb}>
            <Orb mood={mood} size="large" />
            <p className={styles.orbCaption}>
              the Orb — reflects <span className={styles.accent}>{HERO_MOODS[moodIdx % HERO_MOODS.length]}</span> in real time
            </p>
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className={styles.pillarsSection}>
        <div className="wrap-wide">
          <div className={styles.pillars}>
            {PILLARS.map(({ num, title, desc }) => (
              <div key={num} className={styles.pillar}>
                <span className={styles.pillarNum}>{num}</span>
                <h4 className={styles.pillarTitle}>{title}</h4>
                <p className={styles.pillarDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={`${styles.featuresSection} section`}>
        <div className="wrap-wide">
          <div className={styles.featuresHeader}>
            <Eyebrow>What's inside</Eyebrow>
            <h2>Five activities, one crisis safety net</h2>
            <p>Every module opens inline — no redirects, no new tabs. The crisis detector runs on every message, regardless of mood label.</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map(({ icon, title, desc }) => (
              <GlassCard key={title} hover className={styles.featureCard} padding="lg">
                <span className={styles.featureIcon}>{icon}</span>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className={styles.ctaBanner}>
        <div className="wrap">
          <GlassCard accent padding="xl" className={styles.ctaCard}>
            <h2>Ready to talk?</h2>
            <p>No account required. Nothing you type leaves this browser tab — there is no backend in the demo.</p>
            <Button variant="solid" size="lg" as={Link} to="/login">
              Talk now ↗
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* ── Ambient sound controller pill with mute button ── */}
      <button
        className={`${styles.soundPill} ${isMuted ? styles.soundPillMuted : styles.soundPillActive}`}
        onClick={toggleMute}
        title={isMuted ? "Unmute nature ambient music" : "Mute nature ambient music"}
        aria-label={isMuted ? "Unmute nature ambient music" : "Mute nature ambient music"}
        type="button"
      >
        <span className={styles.soundPillIcon}>{isMuted ? '🔇' : '🌿'}</span>
        <span className={styles.soundPillText}>
          {isMuted ? 'Nature sound muted' : 'Nature ambience'}
        </span>
        {!isMuted && isPlaying && (
          <span className={styles.soundWaves}>
            <span /><span /><span />
          </span>
        )}
        <span className={styles.soundPillAction}>
          {isMuted ? 'Unmute' : 'Mute'}
        </span>
      </button>

    </div>
  )
}
