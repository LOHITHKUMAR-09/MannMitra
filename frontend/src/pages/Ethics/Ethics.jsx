import Eyebrow from '@/components/ui/Eyebrow/Eyebrow'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import styles from './Ethics.module.css'

const ETHICS = [
  { num:'01', title:'Not a therapy replacement', body:'MannMitra is explicitly framed as a bridge to human care, not a substitute. Every session can be ended and routed to a professional. The system never claims diagnostic or therapeutic authority.' },
  { num:'02', title:'Transparent about its limits', body:'The companion tells users it is an AI companion, not a clinician. If it cannot help, it says so clearly and points elsewhere. It does not simulate empathy beyond what a simple companion response warrants.' },
  { num:'03', title:'Consent-based logging', body:'Session logging is opt-in, per-session, not once at signup. Students can see what is collected, how long it is kept, and who can access the counsellor-dashboard summary.' },
  { num:'04', title:'Privacy-first storage', body:'Encrypted storage, pseudonymised identifiers, and role-based access control. The system does not retain personally identifiable information without explicit consent.' },
  { num:'05', title:'Crisis always overrides', body:'As shown in the pipeline, the crisis screen runs before the activity-recommendation branch and suppresses it entirely if triggered — the student never receives a "go paint" suggestion alongside a disclosure of serious risk.' },
]

export default function Ethics() {
  return (
    <div className="section">
      <div className="wrap">
        <Eyebrow>Ethics, safety, and privacy</Eyebrow>
        <h2>What this system will not claim</h2>
        <p className={styles.intro}>
          An always-available, non-judgmental chat companion carries a specific risk: it can become a substitute for the human connection or professional care it is meant to be a bridge toward. The design choices below exist to keep the system on the "bridge" side of that line.
        </p>
        <ul className={styles.list}>
          {ETHICS.map(({ num, title, body }) => (
            <li key={num} className={styles.item}>
              <span className={styles.mark}>{num}</span>
              <div>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="wrap">
        <GlassCard alert padding="lg" className={styles.callout}>
          <Eyebrow>Note on this document</Eyebrow>
          <p>
            This page includes a working demonstration of a crisis-language detector for academic purposes. It is a simplified simulation, not a validated clinical tool. If you are affected by anything discussed here, in India you can reach the iCall psychosocial helpline (+91&nbsp;9152987821) or the Vandrevala Foundation helpline (1860‑2662‑345). Outside India: your local emergency number or a national crisis line. In immediate danger: contact emergency services directly.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
