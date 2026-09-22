import Button from '@/components/ui/Button/Button'
import Eyebrow from '@/components/ui/Eyebrow/Eyebrow'
import styles from './LogoutModal.module.css'

/**
 * Confirmation modal for logging out of the account or ending the chat session.
 */
export default function LogoutModal({ isOpen, onClose, onConfirm, onGoHome, user }) {
  if (!isOpen) return null

  const isAccount = Boolean(user)

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <div className={styles.topRow}>
          <div className={styles.iconCircle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <Eyebrow>{isAccount ? 'Account & Session' : 'Chat Session'}</Eyebrow>
          <h3 id="logout-title" className={styles.title}>
            {isAccount ? 'Log out of your account?' : 'End your chat session?'}
          </h3>
          <p className={styles.desc}>
            {isAccount
              ? `You are signed in as ${user.display_name || user.email}. Logging out will clear your active conversation and sign you out of this device.`
              : 'Ending this session will clear all current messages and reset your companion state. Nothing is stored.'}
          </p>

          <div className={styles.privacyNote}>
            <span className={styles.privacyIcon}>🔒</span>
            <div className={styles.privacyText}>
              <strong>Privacy guarantee:</strong> Current session conversation history will be wiped from browser memory.
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} className={styles.cancelBtn}>
            Stay in chat
          </Button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {isAccount ? 'Log out' : 'End session'}
          </button>
        </div>

        {onGoHome && (
          <div className={styles.footer}>
            <button className={styles.homeLink} onClick={onGoHome} type="button">
              ← Return to landing page
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
