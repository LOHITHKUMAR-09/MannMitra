import { TRY_CHIPS } from '@/lib/constants'
import styles from './TryChips.module.css'

export default function TryChips({ onSend }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>Try:</span>
      <div className={styles.chips}>
        {TRY_CHIPS.map(({ label, text }) => (
          <button
            key={label}
            className={styles.chip}
            onClick={() => onSend(text)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
