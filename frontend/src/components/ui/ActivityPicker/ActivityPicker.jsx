import styles from './ActivityPicker.module.css'

const ALL_ACTIVITIES = [
  { key: 'canvas',    label: 'Open Canvas',       icon: '🎨', desc: 'Express yourself through color and shape.' },
  { key: 'music',     label: 'Pentatonic Pad',     icon: '🎵', desc: 'Play calming notes — no wrong notes.' },
  { key: 'game',      label: 'Memory Game',        icon: '🎮', desc: 'A gentle distraction to reset your focus.' },
  { key: 'journal',   label: 'Journal',            icon: '📖', desc: 'Write freely — nothing is saved or sent.' },
  { key: 'breathing', label: 'Guided Breathing',   icon: '🌿', desc: 'Box breathing to calm your nervous system.' },
]

// Maps interest IDs to activity keys
const INTEREST_TO_ACTIVITY = {
  painting:  'canvas',
  music:     'music',
  gaming:    'game',
  writing:   'journal',
  nature:    'breathing',
}

/**
 * Activity picker modal.
 * Props:
 *   interests  — array of selected interest IDs (e.g. ['painting','music'])
 *   onSelect   — (activityKey) => void
 *   onClose    — () => void
 */
export default function ActivityPicker({ interests = [], onSelect, onClose }) {
  const interestedKeys = interests
    .map(id => INTEREST_TO_ACTIVITY[id])
    .filter(Boolean)

  const interested = ALL_ACTIVITIES.filter(a => interestedKeys.includes(a.key))
  const others     = ALL_ACTIVITIES.filter(a => !interestedKeys.includes(a.key))

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Picker */}
      <div className={styles.picker} role="dialog" aria-modal="true" aria-label="Choose an activity">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Activities</p>
            <h3 className={styles.title}>What would you like to do?</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          {interested.length > 0 && (
            <section className={styles.section}>
              <p className={styles.sectionLabel}>
                <span className={styles.dot} style={{ background: 'var(--calm)' }} />
                Based on your interests
              </p>
              <div className={styles.grid}>
                {interested.map(act => (
                  <ActivityCard key={act.key} act={act} onSelect={onSelect} highlighted />
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <p className={styles.sectionLabel}>
              <span className={styles.dot} style={{ background: 'var(--text-faint)' }} />
              {interested.length > 0 ? 'Other activities' : 'All activities'}
            </p>
            <div className={styles.grid}>
              {others.map(act => (
                <ActivityCard key={act.key} act={act} onSelect={onSelect} />
              ))}
            </div>
          </section>
        </div>

        <p className={styles.hint}>
          Activities open in a floating window — you can keep chatting while doing them.
        </p>
      </div>
    </>
  )
}

function ActivityCard({ act, onSelect, highlighted }) {
  return (
    <button
      className={`${styles.card} ${highlighted ? styles.cardHighlighted : ''}`}
      onClick={() => onSelect(act.key)}
    >
      <span className={styles.cardIcon}>{act.icon}</span>
      <span className={styles.cardLabel}>{act.label}</span>
      <span className={styles.cardDesc}>{act.desc}</span>
      {highlighted && <span className={styles.cardBadge}>your interest</span>}
    </button>
  )
}
