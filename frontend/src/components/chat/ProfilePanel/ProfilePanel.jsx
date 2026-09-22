import { INTERESTS } from '@/lib/constants'
import Orb from '@/components/ui/Orb/Orb'
import { moodLabel } from '@/lib/classifier'
import styles from './ProfilePanel.module.css'

export default function ProfilePanel({ interests, onToggle, currentMood }) {
  return (
    <aside className={styles.panel}>
      <h4 className={styles.heading}>Your Interests</h4>
      <p className={styles.hint}>Mitra will tailor activities to what you enjoy.</p>
      <div className={styles.interests}>
        {INTERESTS.map(({ id, label, icon }) => {
          const checked = interests.includes(id)
          return (
            <label
              key={id}
              className={`${styles.opt} ${checked ? styles.checked : ''}`}
              htmlFor={`interest-${id}`}
            >
              <input
                id={`interest-${id}`}
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(id)}
                className={styles.checkbox}
              />
              <span className={styles.icon}>{icon}</span>
              <span className={styles.optLabel}>{label}</span>
              {checked && <span className={styles.check}>✓</span>}
            </label>
          )
        })}
      </div>

      <div className={styles.orbSection}>
        <div className={styles.orbWrap}>
          <Orb mood={currentMood} size="small" />
        </div>
        <div className={styles.moodLabel}>Orb reflects your mood</div>
        <div className={styles.moodName}>{moodLabel[currentMood] || 'Neutral'}</div>
      </div>
    </aside>
  )
}
