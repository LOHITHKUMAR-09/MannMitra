import Eyebrow from '@/components/ui/Eyebrow/Eyebrow'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import styles from './Evaluation.module.css'

const F1_DATA = [
  { label:'happy',   score:0.81, color:'var(--calm)' },
  { label:'sad',     score:0.74, color:'var(--wistful)' },
  { label:'anx.',    score:0.69, color:'var(--tense)' },
  { label:'angry',   score:0.72, color:'var(--heat)' },
  { label:'stress',  score:0.70, color:'var(--slate)' },
  { label:'neutral', score:0.66, color:'rgba(255,255,255,0.15)' },
]

export default function Evaluation() {
  return (
    <div className="section">
      <div className="wrap">
        <Eyebrow>Evaluation plan</Eyebrow>
        <h2>What "good" looks like</h2>
        <p className={styles.intro}>
          The numbers below are <strong>illustrative targets</strong> drawn from ranges reported in published affective-text-classification and CBT-chatbot literature — not results from live student data, which the pilot has not yet collected. They exist to define what the evaluation phase should aim for.
        </p>
      </div>
      <div className="wrap-wide">
        <div className={styles.chartGrid}>
          {/* F1 Bar Chart */}
          <GlassCard padding="lg">
            <h4 className={styles.chartTitle}>Per-class F1 (illustrative targets)</h4>
            <div className={styles.barChart}>
              {F1_DATA.map(({ label, score, color }) => (
                <div key={label} className={styles.barGroup}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.bar}
                      style={{ height:`${score * 100}%`, background: color }}
                      title={`${label}: ${score}`}
                    />
                  </div>
                  <span className={styles.barScore}>{score}</span>
                  <span className={styles.barLabel}>{label}</span>
                </div>
              ))}
            </div>
            <p className={styles.chartNote}>Fig. 3 — Target per-class F1</p>
          </GlassCard>

          {/* Confusion Matrix */}
          <GlassCard padding="lg">
            <h4 className={styles.chartTitle}>Confusion matrix (mock)</h4>
            <div className={styles.matrix}>
              {/* Headers */}
              <div className={styles.matrixHeader}>
                <div className={styles.matrixCorner} />
                {['hap','sad','anx','ang','str','neu'].map(l => (
                  <div key={l} className={styles.matrixHead}>{l}</div>
                ))}
              </div>
              {/* Rows */}
              {[
                { row:'happy',   diag:0, vals:[0.81,0.04,0.03,0.02,0.05,0.05] },
                { row:'sad',     diag:1, vals:[0.05,0.74,0.08,0.02,0.07,0.04] },
                { row:'anxious', diag:2, vals:[0.04,0.07,0.69,0.03,0.12,0.05] },
                { row:'angry',   diag:3, vals:[0.03,0.04,0.04,0.72,0.10,0.07] },
                { row:'stressed',diag:4, vals:[0.04,0.07,0.11,0.05,0.70,0.03] },
                { row:'neutral', diag:5, vals:[0.06,0.05,0.06,0.06,0.11,0.66] },
              ].map(({ row, diag, vals }) => (
                <div key={row} className={styles.matrixRow}>
                  <div className={styles.matrixRowLabel}>{row.slice(0,3)}</div>
                  {vals.map((v, i) => (
                    <div key={i} className={`${styles.matrixCell} ${i===diag?styles.matrixDiag:''}`}
                      style={{ opacity: i===diag ? 0.85 : v * 2 }}
                      title={`${v}`}>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className={styles.chartNote}>Fig. 4 — rows = true label, cols = predicted · most confusion expected between sad↔stressed and anxious↔stressed</p>
          </GlassCard>
        </div>

        <p className={styles.reportNote}>
          Reporting standard for the actual pilot: per-class precision/recall/F1, macro-F1 across all six classes, and — separately — crisis-flag sensitivity and false-negative rate. A missed crisis flag is a categorically more serious error than a missed mood label and should never be averaged into a single accuracy figure.
        </p>
      </div>
    </div>
  )
}
