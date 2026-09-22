import Eyebrow from '@/components/ui/Eyebrow/Eyebrow'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import Badge from '@/components/ui/Badge/Badge'
import styles from './Roadmap.module.css'

const PHASES = [
  { status:'live',    badge:'Phase 1 — In prototype', title:'Text + voice companion', body:'Text-based mood detection and inline activities (canvas, music, memory game, journal, breathing) are functional in the demo. Voice input/output uses the browser\'s native speech APIs as an early accessibility layer.' },
  { status:'roadmap', badge:'Phase 2 — Proposed',      title:'Trained affect + crisis classifiers', body:'Replace the lexicon-based demo classifier with the models described in Methodology, validated on pilot data with faculty oversight, and add a consent-based counsellor dashboard connected to PostgreSQL.' },
  { status:'roadmap', badge:'Phase 3 — Proposed',      title:'Immersive VR environments', body:'For students who opt in, deliver the same activity categories inside short, guided VR scenes — a calm nature walk for a breathing exercise, a distraction-free painting room — with appropriate time-limits for a wellbeing context.' },
  { status:'roadmap', badge:'Phase 4 — Proposed',      title:'Multilingual support', body:'Extend screening and companion dialogue to regional Indian languages, since emotional disclosure is often easier in a first language than in English.' },
]

const TIMELINE = ['text + voice', 'trained classifiers', 'VR environments', 'multilingual']

export default function Roadmap() {
  return (
    <div className="section">
      <div className="wrap">
        <Eyebrow>Roadmap</Eyebrow>
        <h2>What's live now, what comes next</h2>
      </div>
      <div className="wrap-wide">
        <div className={styles.grid}>
          {PHASES.map(({ status, badge, title, body }) => (
            <GlassCard key={title} hover padding="lg" className={styles.card}>
              <Badge variant={status === 'live' ? 'live' : 'roadmap'} className={styles.badge}>{badge}</Badge>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardBody}>{body}</p>
            </GlassCard>
          ))}
        </div>

        {/* Timeline track */}
        <div className={styles.timeline}>
          <div className={styles.timelineTrack} />
          {TIMELINE.map((label, i) => (
            <div key={label} className={styles.timelineStep}>
              <div className={`${styles.dot} ${i===0?styles.dotLive:styles.dotFuture}`} />
              <span className={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
