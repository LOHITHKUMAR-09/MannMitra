import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useChatContext } from '@/context/ChatContext'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { moodGlow } from '@/lib/moodColors'
import { moodLabel, moodEmoji } from '@/lib/classifier'
import { INTERESTS, TRY_CHIPS, HELPLINES, PENTATONIC_NOTES, JOURNAL_PROMPTS } from '@/lib/constants'
import Orb from '@/components/ui/Orb/Orb'
import Button from '@/components/ui/Button/Button'
import styles from './Chat.module.css'

/* ═══════════════════════════════════════════
   Inline Activity Components
   ═══════════════════════════════════════════ */

function CanvasPaint() {
  const canvasRef = useRef(null)
  const [color, setColor] = useState('#6fb8a8')
  const [size, setSize] = useState(6)
  const [tool, setTool] = useState('pen')
  const drawing = useRef(false)
  const last = useRef(null)
  const PALETTE = ['#6fb8a8','#d97a63','#9c8fd1','#d9b54a','#5fa8c9','#cf5a63','#eee8df','#7c86a3']

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#0c0f1e'; ctx.fillRect(0,0,c.width,c.height)
  }, [])

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    const cx = (e.touches?.[0]?.clientX ?? e.clientX) - r.left
    const cy = (e.touches?.[0]?.clientY ?? e.clientY) - r.top
    const c = canvasRef.current
    return { x: cx*(c.width/r.width), y: cy*(c.height/r.height) }
  }
  const onStart = (e) => { drawing.current=true; last.current=getPos(e) }
  const onMove  = (e) => {
    if (!drawing.current) return; e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = getPos(e)
    ctx.strokeStyle = tool==='eraser'?'#0c0f1e':color
    ctx.lineWidth   = tool==='eraser'?size*4:size
    ctx.lineCap='round'; ctx.lineJoin='round'
    ctx.beginPath(); ctx.moveTo(last.current.x,last.current.y); ctx.lineTo(p.x,p.y); ctx.stroke()
    last.current=p
  }
  const onEnd = () => { drawing.current=false }
  const clear = () => { const c=canvasRef.current; const ctx=c.getContext('2d'); ctx.fillStyle='#0c0f1e'; ctx.fillRect(0,0,c.width,c.height) }
  const download = () => { const a=document.createElement('a'); a.download='mannmitra-canvas.png'; a.href=canvasRef.current.toDataURL(); a.click() }

  return (
    <div className={styles.actCanvas}>
      <p className={styles.actIntro}>Use color and shape to express what words can't.</p>
      <div className={styles.canvasToolbar}>
        <div className={styles.palette}>
          {PALETTE.map(c=>(
            <button key={c} className={`${styles.swatch} ${color===c&&tool==='pen'?styles.swatchActive:''}`}
              style={{background:c}} onClick={()=>{setColor(c);setTool('pen')}} />
          ))}
        </div>
        <label className={styles.sizeLabel}><span>Size</span>
          <input type="range" min="2" max="28" value={size} onChange={e=>setSize(+e.target.value)} className={styles.range} />
        </label>
        <button className={`${styles.toolBtn} ${tool==='eraser'?styles.toolActive:''}`} onClick={()=>setTool('eraser')}>✕ Erase</button>
        <button className={styles.toolBtn} onClick={clear}>Clear</button>
        <button className={`${styles.toolBtn} ${styles.toolSave}`} onClick={download}>↓ Save</button>
      </div>
      <canvas ref={canvasRef} width={700} height={320} className={styles.canvas}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
        style={{cursor:tool==='eraser'?'cell':'crosshair'}} />
    </div>
  )
}

function MusicPad() {
  const actxRef = useRef(null)
  const [active, setActive] = useState(null)
  const play = (freq,label) => {
    try {
      if (!actxRef.current) actxRef.current = new (window.AudioContext||window.webkitAudioContext)()
      const a=actxRef.current
      const osc=a.createOscillator(); const gain=a.createGain()
      osc.type='sine'; osc.frequency.value=freq
      gain.gain.setValueAtTime(0.22,a.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001,a.currentTime+1.4)
      osc.connect(gain); gain.connect(a.destination)
      osc.start(); osc.stop(a.currentTime+1.4)
      setActive(label); setTimeout(()=>setActive(null),300)
    } catch {}
  }
  return (
    <div className={styles.actMusic}>
      <p className={styles.actIntro}>A pentatonic scale — any combination sounds pleasant. No wrong notes.</p>
      <div className={styles.keys}>
        {PENTATONIC_NOTES.map(({label,freq,color})=>(
          <button key={label} className={`${styles.key} ${active===label?styles.keyActive:''}`}
            style={{'--kc':color}} onMouseDown={()=>play(freq,label)}
            onTouchStart={e=>{e.preventDefault();play(freq,label)}}>
            <span>{label}</span>
            <span className={styles.keyGlow} style={{background:color}} />
          </button>
        ))}
      </div>
    </div>
  )
}

function MemoryGame() {
  const ICONS=['🎨','🎵','🌿','📖','🎮','🧩','🌊','✨']
  const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]};return a}
  const [cards,setCards]=useState(()=>shuffle([...ICONS,...ICONS]).map((icon,i)=>({id:i,icon})))
  const [flipped,setFlipped]=useState([])
  const [matched,setMatched]=useState(new Set())
  const [moves,setMoves]=useState(0)
  const [locked,setLocked]=useState(false)
  const [won,setWon]=useState(false)
  const reset=()=>{setCards(shuffle([...ICONS,...ICONS]).map((icon,i)=>({id:i,icon})));setFlipped([]);setMatched(new Set());setMoves(0);setLocked(false);setWon(false)}
  const flip=(card)=>{
    if(locked||flipped.includes(card.id)||matched.has(card.icon)) return
    const nf=[...flipped,card.id];setFlipped(nf)
    if(nf.length===2){
      setMoves(m=>m+1);setLocked(true)
      const [a,b]=nf.map(id=>cards.find(c=>c.id===id))
      if(a.icon===b.icon){const nm=new Set([...matched,a.icon]);setMatched(nm);setFlipped([]);setLocked(false);if(nm.size===ICONS.length)setWon(true)}
      else{setTimeout(()=>{setFlipped([]);setLocked(false)},800)}
    }
  }
  return (
    <div className={styles.actGame}>
      <div className={styles.gameHeader}>
        <div className={styles.gameStat}><span className={styles.gameNum}>{moves}</span><span className={styles.gameLabel}>moves</span></div>
        <div className={styles.gameStat}><span className={styles.gameNum}>{matched.size}/{ICONS.length}</span><span className={styles.gameLabel}>matched</span></div>
        <button className={styles.gameReset} onClick={reset}>Restart</button>
      </div>
      {won&&<div className={styles.gameWon}>🎉 All matched in {moves} moves!</div>}
      <div className={styles.gameGrid}>
        {cards.map(card=>{const isF=flipped.includes(card.id);const isM=matched.has(card.icon);return(
          <button key={card.id} className={`${styles.memCard} ${isF||isM?styles.memFlipped:''} ${isM?styles.memMatched:''}`} onClick={()=>flip(card)}>
            {isF||isM?<span>{card.icon}</span>:<span className={styles.memBack}>?</span>}
          </button>
        )})}
      </div>
    </div>
  )
}

function JournalPad() {
  const [text,setText]=useState('')
  const prompt=useRef(JOURNAL_PROMPTS[Math.floor(Math.random()*JOURNAL_PROMPTS.length)]).current
  const words=text.trim().split(/\s+/).filter(Boolean).length
  return (
    <div className={styles.actJournal}>
      <div className={styles.journalPrompt}><span className={styles.journalTag}>Prompt</span><p>{prompt}</p></div>
      <textarea className={styles.journalBox} value={text} onChange={e=>setText(e.target.value)}
        placeholder="Write freely — nothing is sent anywhere." rows={6} />
      <div className={styles.journalFooter}><span>{words} {words===1?'word':'words'}</span><span>🔒 local only</span></div>
    </div>
  )
}

function Breathing() {
  const PHASES=[{label:'Breathe in…',dur:4000,scale:1.55},{label:'Hold…',dur:1500,scale:1.55},{label:'Breathe out…',dur:4000,scale:1},{label:'Hold…',dur:1000,scale:1}]
  const [running,setRunning]=useState(false)
  const [pi,setPi]=useState(0)
  const [cycles,setCycles]=useState(0)
  const timer=useRef(null)
  const run=(idx)=>{setPi(idx);if(idx===0)setCycles(c=>c+1);timer.current=setTimeout(()=>run((idx+1)%4),PHASES[idx].dur)}
  const toggle=()=>{if(running){clearTimeout(timer.current);setRunning(false);setPi(0)}else{setRunning(true);setCycles(0);run(0)}}
  useEffect(()=>()=>clearTimeout(timer.current),[])
  return (
    <div className={styles.actBreath}>
      <p className={styles.actIntro}>Box breathing — activates the parasympathetic nervous system.</p>
      <div className={styles.breathStage}>
        <div className={styles.breathCircle} style={running?{transform:`scale(${PHASES[pi].scale})`,transition:`transform ${PHASES[pi].dur}ms ease-in-out`}:{}} />
        <p className={styles.breathLabel}>{running?PHASES[pi].label:'Press Start'}</p>
        {running&&cycles>0&&<p className={styles.breathCycles}>{cycles} {cycles===1?'cycle':'cycles'}</p>}
      </div>
      <div className={styles.breathPhases}>
        {PHASES.map((p,i)=>(
          <div key={i} className={`${styles.breathPhase} ${running&&pi===i?styles.breathPhaseActive:''}`}>
            <span className={styles.breathDot} />{p.label.replace('…','')} <span className={styles.breathDur}>{p.dur/1000}s</span>
          </div>
        ))}
      </div>
      <button className={`${styles.breathBtn} ${running?styles.breathBtnStop:styles.breathBtnStart}`} onClick={toggle}>
        {running?'Stop':'Start breathing'}
      </button>
    </div>
  )
}

const ACTIVITY_MAP = {
  canvas:    { component:CanvasPaint, title:'🎨 Open Canvas' },
  music:     { component:MusicPad,   title:'🎵 Pentatonic Pad' },
  game:      { component:MemoryGame, title:'🎮 Memory Game' },
  journal:   { component:JournalPad, title:'📖 Journal' },
  breathing: { component:Breathing,  title:'🌿 Guided Breathing' },
}

/* ═══════════════════════════════════════════
   Full-Screen Chat Page
   ═══════════════════════════════════════════ */
export default function Chat() {
  const { interests, toggleInterest } = useChatContext()
  const { speak, voiceOutputOn, toggleVoiceOutput, isListening, startListening, hasSpeechSynthesis, hasSpeechRecognition } = useSpeech()
  const { messages, currentMood, isTyping, handleSend } = useChat(interests, speak)
  const [inputVal, setInputVal] = useState('')
  const [activeActivity, setActiveActivity] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const logRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const send = () => {
    const t = inputVal.trim(); if (!t) return
    handleSend(t); setInputVal('')
  }

  const glow = moodGlow[currentMood] || moodGlow.neutral

  return (
    <div className={styles.fullPage}>

      {/* ── Top bar ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(p => !p)} title="Toggle profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <Link to="/" className={styles.headerBrand}>
            <span className={styles.headerDot} />
            <span className={styles.headerName}>MannMitra</span>
          </Link>
          <span className={styles.headerSep}>·</span>
          <span className={styles.sessionLabel}>session (local)</span>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.moodPill} style={{ borderColor:`${glow}44`, background:`${glow}10` }}>
            <span>{moodEmoji[currentMood]}</span>
            <span className={styles.moodPillLabel}>{moodLabel[currentMood] || 'Neutral'}</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          {hasSpeechRecognition && (
            <button className={`${styles.iconBtn} ${isListening?styles.iconBtnActive:''}`}
              onClick={() => startListening(t => setInputVal(t))} title={isListening?'Listening…':'Voice input'}>
              🎤
            </button>
          )}
          {hasSpeechSynthesis && (
            <button className={`${styles.iconBtn} ${voiceOutputOn?styles.iconBtnActive:''}`}
              onClick={toggleVoiceOutput} title="Voice output">
              {voiceOutputOn ? '🔊' : '🔇'}
            </button>
          )}
          <button className={styles.iconBtn} onClick={() => navigate('/')} title="Back to home">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* ── Sidebar ── */}
        <aside className={`${styles.sidebar} ${sidebarOpen?styles.sidebarOpen:''}`}>
          <div className={styles.orbSection}>
            <Orb mood={currentMood} size="medium" />
            <p className={styles.orbMoodText}>{moodEmoji[currentMood]} {moodLabel[currentMood] || 'Neutral'}</p>
          </div>

          <div className={styles.sideSection}>
            <p className={styles.sideLabel}>Interests</p>
            <p className={styles.sideHint}>Mitra suggests activities you enjoy.</p>
            <div className={styles.interestList}>
              {INTERESTS.map(({ id, label, icon }) => {
                const checked = interests.includes(id)
                return (
                  <label key={id} className={`${styles.interest} ${checked?styles.interestChecked:''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleInterest(id)} className={styles.interestCb} />
                    <span>{icon}</span>
                    <span className={styles.interestLabel}>{label}</span>
                    {checked && <span className={styles.check}>✓</span>}
                  </label>
                )
              })}
            </div>
          </div>

          <div className={styles.sideSection}>
            <p className={styles.sideLabel}>Try an activity</p>
            <div className={styles.activityBtns}>
              {Object.entries(ACTIVITY_MAP).map(([key,{title}]) => (
                <button key={key} className={`${styles.actBtn} ${activeActivity===key?styles.actBtnActive:''}`}
                  onClick={() => setActiveActivity(prev => prev===key?null:key)}>
                  {title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Chat area ── */}
        <div className={styles.chatArea}>

          {/* Message log */}
          <div className={styles.log} ref={logRef} role="log" aria-live="polite">
            {messages.map(msg => (
              <div key={msg.id} className={styles.msgWrap}>
                {msg.role === 'user' && (
                  <div className={styles.userBubble}><p>{msg.text}</p></div>
                )}
                {msg.role === 'bot' && (
                  <div className={styles.botRow}>
                    <div className={styles.avatar} style={{background:`radial-gradient(circle at 35% 30%, ${moodGlow[msg.mood]||'#6fb8a8'}, #0f111a 72%)`}}>M</div>
                    <div className={styles.botContent}>
                      <div className={styles.botBubble}>
                        <p>{msg.text}</p>
                        {msg.mood && msg.mood!=='neutral' && (
                          <span className={styles.moodTag}>{moodEmoji[msg.mood]} detected: {msg.mood}</span>
                        )}
                      </div>
                      {msg.activity && (
                        <div className={styles.actSuggest}>
                          <p className={styles.actLead}>Since you enjoy <strong>{msg.activity.interest}</strong> — {msg.activity.description}</p>
                          <button className={styles.actSuggestBtn}
                            onClick={() => setActiveActivity(prev => prev===msg.activity.key?null:msg.activity.key)}>
                            {msg.activity.icon} {msg.activity.label}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {msg.role === 'crisis' && (
                  <div className={styles.crisisBubble}>
                    <div className={styles.crisisHeader}><span>🆘</span><span>Human support needed</span></div>
                    <p>{msg.text}</p>
                    <div className={styles.helplines}>
                      {HELPLINES.map(({name,contact}) => (
                        <div key={name} className={styles.helpline}>
                          <span>{name}</span><strong>{contact}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className={styles.botRow}>
                <div className={styles.avatar}>M</div>
                <div className={styles.typingDots}><span /><span /><span /></div>
              </div>
            )}
          </div>

          {/* Activity panel */}
          {activeActivity && (() => {
            const entry = ACTIVITY_MAP[activeActivity]
            if (!entry) return null
            const Comp = entry.component
            return (
              <div className={styles.activityPanel}>
                <div className={styles.actHeader}>
                  <span className={styles.actTitle}>{entry.title}</span>
                  <button className={styles.actClose} onClick={() => setActiveActivity(null)}>✕ close</button>
                </div>
                <div className={styles.actBody}><Comp /></div>
              </div>
            )
          })()}

          {/* Try chips */}
          <div className={styles.chips}>
            <span className={styles.chipsLabel}>Try:</span>
            {TRY_CHIPS.map(({label,text}) => (
              <button key={label} className={styles.chip} onClick={() => handleSend(text)}>{label}</button>
            ))}
          </div>

          {/* Input bar */}
          <div className={styles.inputBar}>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Tell me how you're feeling…"
              className={styles.input}
            />
            <button className={styles.sendBtn} onClick={send} disabled={!inputVal.trim()}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
