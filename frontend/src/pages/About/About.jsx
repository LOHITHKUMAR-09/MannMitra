import Eyebrow from '@/components/ui/Eyebrow/Eyebrow'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import styles from './About.module.css'

const METHODS = [
  { tag:'Task',       title:'Six-class affect classification', body:'happy · sad · anxious · angry · stressed · neutral, plus an orthogonal binary crisis flag evaluated on every message regardless of mood label.' },
  { tag:'Features',  title:'Lexical + contextual',             body:'Word/phrase-level sentiment scores, negation handling, punctuation intensity, and short-term conversation history (last 2–3 turns) to reduce single-message misreads.' },
  { tag:'Models',    title:'Interpretable first, complex later',body:'Baseline: logistic regression / gradient boosting over lexicon + TF-IDF. Stretch goal: fine-tuned lightweight transformer benchmarked against the baseline.' },
  { tag:'Crisis',    title:'Hybrid, not keyword-only',         body:'A curated phrase-matching layer catches unambiguous high-risk language immediately; a separate risk classifier catches indirect phrasing. Either firing is sufficient.' },
  { tag:'Data',      title:'Pilot + literature-informed benchmarks', body:'Small volunteer pilot dataset from consenting students, supplemented by published affective-text benchmarks. Pilot results and benchmark results are always reported separately.' },
]

export default function About() {
  return (
    <div className={styles.page}>

      {/* ── Framework ── */}
      <section className={`${styles.section} section`}>
        <div className="wrap">
          <Eyebrow>Theoretical framework</Eyebrow>
          <h2>Why an activity, and why <em>this</em> one</h2>
          <p className={styles.intro}>
            The design leans on three ideas from affect and clinical psychology. First, <strong>dimensional and discrete emotion models</strong> (Russell's circumplex; Plutchik's wheel) give a usable vocabulary for turning free text into actionable categories. Second, <strong>behavioral activation</strong> — engaging in a valued, absorbing activity can shift mood before mood itself has to shift first — motivates suggesting a concrete task rather than just reflecting feelings back. Third, <strong>mood-congruent processing</strong> suggests a student in a low mood is more likely to accept a suggestion that is personally meaningful.
          </p>
        </div>

        <div className="wrap-wide">
          <div className={styles.split}>
            {/* Plutchik Wheel SVG */}
            <div className={styles.wheelWrap}>
              <svg viewBox="0 0 420 420" className={styles.wheel}>
                <circle cx="210" cy="210" r="46" fill="rgba(30,35,55,0.9)" stroke="rgba(255,255,255,0.08)"/>
                <text x="210" y="206" textAnchor="middle" fill="#eee8df" fontFamily="IBM Plex Mono" fontSize="11">CORE</text>
                <text x="210" y="220" textAnchor="middle" fill="#555d7a" fontFamily="IBM Plex Mono" fontSize="9">AFFECT</text>
                {[['0','#6fb8a8'],['45','#7fbf9e'],['90','#d97a63'],['135','#5fa8c9'],['180','#9c8fd1'],['225','#8a8f5c'],['270','#cf5a63'],['315','#d9b54a']].map(([deg,color]) => (
                  <g key={deg} transform={`rotate(${deg} 210 210)`}>
                    <ellipse cx="210" cy="118" rx="42" ry="88" fill={color} opacity="0.82"/>
                  </g>
                ))}
                <circle cx="210" cy="210" r="34" fill="#080b14" opacity="0.55"/>
                {[['210','30','Joy'],['333','82','Trust'],['382','214','Fear'],['333','340','Surprise'],['210','398','Sadness'],['80','340','Disgust'],['35','214','Anger'],['80','82','Anticipation']].map(([x,y,label]) => (
                  <text key={label} x={x} y={y} textAnchor="middle" fill="#eee8df" fontFamily="IBM Plex Mono" fontSize="11">{label}</text>
                ))}
              </svg>
              <p className={styles.wheelCaption}>Fig. 1 — Plutchik's wheel of emotions, used as a labelling scaffold for the classifier's category set</p>
            </div>

            {/* Theory methods */}
            <div className={styles.theories}>
              {[['Russell','Circumplex model','Places affect on two continuous axes — valence (unpleasant↔pleasant) and arousal (calm↔activated) — how the demo classifier scores a message before mapping to a discrete label.'],
                ['Plutchik','Eight primary emotions','Gives a small, teachable vocabulary (joy, trust, fear, surprise, sadness, disgust, anger, anticipation) that collapses into the six working categories: happy, sad, anxious, angry, stressed, neutral.'],
                ['Lewinsohn','Behavioral activation','The clinical basis for the core mechanic — re-engagement with a valued activity is proposed as a route to mood repair, which is why the system acts rather than only empathises.']
              ].map(([tag,title,body]) => (
                <div key={tag} className={styles.theoryRow}>
                  <span className={styles.theoryTag}>{tag}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className={`${styles.section} section`}>
        <div className="wrap">
          <Eyebrow>System design</Eyebrow>
          <h2>How a message becomes an action</h2>
          <p>Every message passes through the same pipeline. The only branch point is the crisis screen: if it fires, the activity-recommendation path is skipped entirely for that turn.</p>
        </div>
        <div className="wrap-wide">
          <GlassCard padding="lg" className={styles.diagCard}>
            <svg viewBox="0 0 1040 540" style={{width:'100%',height:'auto',display:'block'}}>
              <defs>
                <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#555d7a"/>
                </marker>
                <marker id="arrAlert" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#e4555f"/>
                </marker>
              </defs>
              <rect x="850" y="10" width="180" height="510" fill="#e4555f" opacity="0.03"/>
              <text x="940" y="530" textAnchor="middle" fill="#e4555f" fontFamily="IBM Plex Mono" fontSize="9" opacity="0.6">crisis lane</text>
              <g fontFamily="IBM Plex Mono" fontSize="11">
                {[['20','30','170','User input','text · voice (beta)'],['225','30','190','NLP preprocessing','normalize · tokenize'],['455','30','200','Emotion classifier','6-class affect model']].map(([x,y,w,t,s])=>(
                  <g key={t}>
                    <rect x={x} y={y} width={w} height="50" rx="6" fill="rgba(20,24,40,0.8)" stroke="rgba(255,255,255,0.09)"/>
                    <text x={+x + +w/2} y={+y+22} textAnchor="middle" fill="#eee8df">{t}</text>
                    <text x={+x + +w/2} y={+y+38} textAnchor="middle" fill="#555d7a" fontSize="9.5">{s}</text>
                  </g>
                ))}
                <rect x="855" y="30" width="160" height="50" rx="6" fill="rgba(228,85,95,0.12)" stroke="#e4555f"/>
                <text x="935" y="52" textAnchor="middle" fill="#f3c7ca">Crisis screen</text>
                <text x="935" y="68" textAnchor="middle" fill="#e9a7ab" fontSize="9.5">keyword + model</text>
                <polygon points="935,130 995,165 935,200 875,165" fill="rgba(30,35,55,0.8)" stroke="rgba(255,255,255,0.09)"/>
                <text x="935" y="161" textAnchor="middle" fill="#eee8df" fontSize="10">risk</text>
                <text x="935" y="175" textAnchor="middle" fill="#eee8df" fontSize="10">flagged?</text>
                <rect x="855" y="250" width="160" height="55" rx="6" fill="rgba(228,85,95,0.12)" stroke="#e4555f"/>
                <text x="935" y="272" textAnchor="middle" fill="#f3c7ca" fontSize="10.5">Yes → Human handoff</text>
                <text x="935" y="288" textAnchor="middle" fill="#e9a7ab" fontSize="9">helpline + counsellor</text>
                <text x="935" y="302" textAnchor="middle" fill="#e9a7ab" fontSize="9">(mood path skipped)</text>
                <rect x="455" y="250" width="200" height="55" rx="6" fill="rgba(20,24,40,0.8)" stroke="rgba(255,255,255,0.09)"/>
                <text x="555" y="272" textAnchor="middle" fill="#eee8df" fontSize="10.5">No → Decision engine</text>
                <text x="555" y="288" textAnchor="middle" fill="#555d7a" fontSize="10">mood ≠ happy?</text>
                <rect x="215" y="250" width="200" height="55" rx="6" fill="rgba(20,24,40,0.8)" stroke="rgba(255,255,255,0.09)"/>
                <text x="315" y="272" textAnchor="middle" fill="#eee8df" fontSize="10.5">Interest profile</text>
                <text x="315" y="288" textAnchor="middle" fill="#555d7a" fontSize="10">student-declared, editable</text>
                <rect x="330" y="380" width="260" height="55" rx="6" fill="rgba(20,24,40,0.8)" stroke="#6fb8a8" strokeOpacity="0.4"/>
                <text x="460" y="402" textAnchor="middle" fill="#eee8df" fontSize="10.5">Activity recommendation</text>
                <text x="460" y="418" textAnchor="middle" fill="#555d7a" fontSize="9">canvas · game · music · journal · breath</text>
                <rect x="620" y="380" width="200" height="55" rx="6" fill="rgba(20,24,40,0.8)" stroke="#6fb8a8" strokeOpacity="0.4"/>
                <text x="720" y="402" textAnchor="middle" fill="#eee8df" fontSize="10.5">Inline module opens</text>
                <text x="720" y="418" textAnchor="middle" fill="#555d7a" fontSize="9.5">same page, no redirect</text>
                <rect x="215" y="470" width="400" height="50" rx="6" fill="rgba(20,24,40,0.8)" stroke="rgba(255,255,255,0.09)"/>
                <text x="415" y="492" textAnchor="middle" fill="#eee8df">Encrypted session log</text>
                <text x="415" y="508" textAnchor="middle" fill="#555d7a" fontSize="10">pseudonymised · access-controlled</text>
              </g>
              <g stroke="#555d7a" strokeWidth="1.2" fill="none" markerEnd="url(#arr)">
                <line x1="190" y1="55" x2="223" y2="55"/>
                <line x1="415" y1="55" x2="453" y2="55"/>
                <line x1="875" y1="165" x2="557" y2="165"/>
                <line x1="555" y1="165" x2="555" y2="248"/>
                <line x1="555" y1="305" x2="462" y2="378"/>
                <line x1="315" y1="305" x2="412" y2="378"/>
                <line x1="590" y1="408" x2="618" y2="408"/>
                <line x1="720" y1="435" x2="422" y2="468"/>
              </g>
              <g stroke="#555d7a" strokeWidth="1.2" fill="none" markerEnd="url(#arr)">
                <line x1="655" y1="55" x2="853" y2="55"/>
              </g>
              <g stroke="#e4555f" strokeWidth="1.2" fill="none" markerEnd="url(#arrAlert)" opacity="0.75">
                <line x1="935" y1="80" x2="935" y2="128"/>
                <line x1="935" y1="200" x2="935" y2="248"/>
                <line x1="935" y1="305" x2="935" y2="435"/>
                <line x1="935" y1="435" x2="617" y2="468"/>
              </g>
              <text x="700" y="155" fill="#555d7a" fontFamily="IBM Plex Mono" fontSize="10">no</text>
              <text x="950" y="222" fill="#e4555f" fontFamily="IBM Plex Mono" fontSize="10">yes</text>
            </svg>
            <p className={styles.diagCaption}>Fig. 2 — Message pipeline. Crisis lane (right, red) runs independently and only rejoins at the shared log — it never reaches the activity branch.</p>
          </GlassCard>
        </div>
      </section>

      {/* ── Methodology ── */}
      <section className={`${styles.section} section`}>
        <div className="wrap">
          <Eyebrow>Methodology</Eyebrow>
          <h2>What the model is, in plain terms</h2>
          {METHODS.map(({ tag, title, body }) => (
            <div key={tag} className={styles.methodRow}>
              <span className={styles.methodTag}>{tag}</span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
