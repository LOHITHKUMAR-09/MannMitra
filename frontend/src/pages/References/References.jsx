import Eyebrow from '@/components/ui/Eyebrow/Eyebrow'
import styles from './References.module.css'

const REFS = [
  'Plutchik, R. (1980). A general psychoevolutionary theory of emotion. In Theories of Emotion. Academic Press.',
  'Russell, J. A. (1980). A circumplex model of affect. Journal of Personality and Social Psychology, 39(6).',
  'Ekman, P. (1992). An argument for basic emotions. Cognition and Emotion, 6(3–4).',
  'Lewinsohn, P. M., & Graf, M. (1973). Pleasant activities and depression. Journal of Consulting and Clinical Psychology, 41(2).',
  'Picard, R. W. (1997). Affective Computing. MIT Press.',
  'Bickmore, T., & Picard, R. (2005). Establishing and maintaining long-term human–computer relationships. ACM Transactions on Computer-Human Interaction, 12(2).',
  'Fitzpatrick, K. K., Darcy, A., & Vierhile, M. (2017). Delivering CBT to young adults with symptoms of depression and anxiety using a fully automated conversational agent (Woebot). JMIR Mental Health, 4(2).',
  'Inkster, B., Sarda, S., & Subramanian, V. (2018). An empathy-driven, conversational artificial intelligence agent (Wysa) for digital mental well-being. JMIR mHealth and uHealth, 6(11).',
]

export default function References() {
  return (
    <div className="section">
      <div className="wrap">
        <Eyebrow>Key references</Eyebrow>
        <h2>Grounding literature</h2>
        <ol className={styles.list}>
          {REFS.map((ref, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.num}>{String(i+1).padStart(2,'0')}</span>
              <span className={styles.text}>{ref}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
