import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useChatContext } from '@/context/ChatContext'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { moodGlow } from '@/lib/moodColors'
import { moodLabel, moodEmoji } from '@/lib/classifier'
import { INTERESTS, TRY_CHIPS, HELPLINES, PENTATONIC_NOTES, JOURNAL_PROMPTS } from '@/lib/constants'
import Orb from '@/components/ui/Orb/Orb'
import FloatingWindow from '@/components/ui/FloatingWindow/FloatingWindow'
import ActivityPicker from '@/components/ui/ActivityPicker/ActivityPicker'
import LogoutModal from '@/components/ui/LogoutModal/LogoutModal'
import { logout, getMe, isAuthenticated } from '@/services/authService'
import styles from './Chat.module.css'

/* ═══════════════════════════════════════════
   Activity Components (inline)
   ═══════════════════════════════════════════ */

function CanvasPaint() {
  const canvasRef = useRef(null)
  const [color, setColor] = useState('#6fb8a8')
  const [size, setSize] = useState(6)
  const [tool, setTool] = useState('pen')
  const drawing = useRef(false)
  const last    = useRef(null)
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
    const c  = canvasRef.current
    return { x: cx*(c.width/r.width), y: cy*(c.height/r.height) }
  }
  const onStart = (e) => { drawing.current=true; last.current=getPos(e) }
  const onMove  = (e) => {
    if (!drawing.current) return; e.preventDefault()
    const ctx = canvasRef.current.getContext('2d'), p = getPos(e)
    ctx.strokeStyle = tool==='eraser'?'#0c0f1e':color
    ctx.lineWidth   = tool==='eraser'?size*4:size
    ctx.lineCap='round'; ctx.lineJoin='round'
    ctx.beginPath(); ctx.moveTo(last.current.x,last.current.y); ctx.lineTo(p.x,p.y); ctx.stroke()
    last.current=p
  }
  const onEnd = () => { drawing.current=false }
  const clear = () => { const c=canvasRef.current,ctx=c.getContext('2d'); ctx.fillStyle='#0c0f1e'; ctx.fillRect(0,0,c.width,c.height) }
  const save  = () => { const a=document.createElement('a'); a.download='mannmitra-canvas.png'; a.href=canvasRef.current.toDataURL(); a.click() }

  return (
    <div className={styles.actCanvas}>
      <div className={styles.canvasToolbar}>
        <div className={styles.palette}>{PALETTE.map(c=>(
          <button key={c} className={`${styles.swatch} ${color===c&&tool==='pen'?styles.swatchActive:''}`}
            style={{background:c}} onClick={()=>{setColor(c);setTool('pen')}} />
        ))}</div>
        <label className={styles.sizeLabel}><span>Size</span>
          <input type="range" min="2" max="28" value={size} onChange={e=>setSize(+e.target.value)} className={styles.range} />
        </label>
        <button className={`${styles.toolBtn} ${tool==='eraser'?styles.toolActive:''}`} onClick={()=>setTool('eraser')}>Erase</button>
        <button className={styles.toolBtn} onClick={clear}>Clear</button>
        <button className={`${styles.toolBtn} ${styles.toolSave}`} onClick={save}>Save</button>
      </div>
      <canvas ref={canvasRef} width={680} height={300} className={styles.canvas}
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
      const a=actxRef.current, osc=a.createOscillator(), gain=a.createGain()
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
      <p className={styles.actIntro}>A pentatonic scale — any combination sounds pleasant.</p>
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
  const [flipped,setFlipped]=useState([]); const [matched,setMatched]=useState(new Set())
  const [moves,setMoves]=useState(0); const [locked,setLocked]=useState(false); const [won,setWon]=useState(false)
  const reset=()=>{setCards(shuffle([...ICONS,...ICONS]).map((icon,i)=>({id:i,icon})));setFlipped([]);setMatched(new Set());setMoves(0);setLocked(false);setWon(false)}
  const flip=(card)=>{
    if(locked||flipped.includes(card.id)||matched.has(card.icon)) return
    const nf=[...flipped,card.id]; setFlipped(nf)
    if(nf.length===2){
      setMoves(m=>m+1); setLocked(true)
      const [a,b]=nf.map(id=>cards.find(c=>c.id===id))
      if(a.icon===b.icon){const nm=new Set([...matched,a.icon]);setMatched(nm);setFlipped([]);setLocked(false);if(nm.size===ICONS.length)setWon(true)}
      else setTimeout(()=>{setFlipped([]);setLocked(false)},800)
    }
  }
  return (
    <div className={styles.actGame}>
      <div className={styles.gameHeader}>
        <div className={styles.gameStat}><span className={styles.gameNum}>{moves}</span><span className={styles.gameLabel}>moves</span></div>
        <div className={styles.gameStat}><span className={styles.gameNum}>{matched.size}/{ICONS.length}</span><span className={styles.gameLabel}>matched</span></div>
        <button className={styles.gameReset} onClick={reset}>Restart</button>
      </div>
      {won&&<div className={styles.gameWon}>All matched in {moves} moves!</div>}
      <div className={styles.gameGrid}>
        {cards.map(card=>{const isF=flipped.includes(card.id),isM=matched.has(card.icon);return(
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
        placeholder="Write freely — nothing is sent anywhere." rows={7} />
      <div className={styles.journalFooter}><span>{words} words</span><span>local only</span></div>
    </div>
  )
}

function Breathing() {
  const PHASES=[{label:'Breathe in…',dur:4000,scale:1.55},{label:'Hold…',dur:1500,scale:1.55},{label:'Breathe out…',dur:4000,scale:1},{label:'Hold…',dur:1000,scale:1}]
  const [running,setRunning]=useState(false); const [pi,setPi]=useState(0); const [cycles,setCycles]=useState(0)
  const timer=useRef(null)
  const run=(idx)=>{setPi(idx);if(idx===0)setCycles(c=>c+1);timer.current=setTimeout(()=>run((idx+1)%4),PHASES[idx].dur)}
  const toggle=()=>{if(running){clearTimeout(timer.current);setRunning(false);setPi(0)}else{setRunning(true);setCycles(0);run(0)}}
  useEffect(()=>()=>clearTimeout(timer.current),[])
  return (
    <div className={styles.actBreath}>
      <div className={styles.breathStage}>
        <div className={styles.breathCircle} style={running?{transform:`scale(${PHASES[pi].scale})`,transition:`transform ${PHASES[pi].dur}ms ease-in-out`}:{}} />
        <p className={styles.breathLabel}>{running?PHASES[pi].label:'Press Start'}</p>
        {running&&cycles>0&&<p className={styles.breathCycles}>{cycles} {cycles===1?'cycle':'cycles'}</p>}
      </div>
      <div className={styles.breathPhases}>
        {PHASES.map((p,i)=>(
          <div key={i} className={`${styles.breathPhase} ${running&&pi===i?styles.breathPhaseActive:''}`}>
            <span className={styles.breathDot}/>{p.label.replace('…','')} <span className={styles.breathDur}>{p.dur/1000}s</span>
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
  canvas:    { component: CanvasPaint, title: 'Open Canvas',      icon: '🎨' },
  music:     { component: MusicPad,   title: 'Pentatonic Pad',   icon: '🎵' },
  game:      { component: MemoryGame, title: 'Memory Game',       icon: '🎮' },
  journal:   { component: JournalPad, title: 'Journal',           icon: '📖' },
  breathing: { component: Breathing,  title: 'Guided Breathing',  icon: '🌿' },
}

/* ═══════════════════════════════════════════
   Full-Screen Chat Page
   ═══════════════════════════════════════════ */
export default function Chat() {
  const { interests, toggleInterest } = useChatContext()
  const { speak, speakDirect, stopSpeaking, speakingId, isListening, startListening, hasSpeechSynthesis, hasSpeechRecognition } = useSpeech()
  const { messages, currentMood, isTyping, handleSend } = useChat(interests, speak)

  const [inputVal, setInputVal]             = useState('')
  const [sidebarOpen, setSidebarOpen]       = useState(true)
  const [showPicker, setShowPicker]         = useState(false)
  const [activeActivity, setActiveActivity] = useState(null)   // key of open floating activity
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [currentUser, setCurrentUser]       = useState(null)
  const logRef   = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) {
      getMe()
        .then(user => setCurrentUser(user))
        .catch(() => setCurrentUser(null))
    }
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-open picker when bot suggests an activity
  useEffect(() => {
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role === 'bot' && last.activity) {
      // Small delay so the bot message renders first
      const t = setTimeout(() => setShowPicker(true), 600)
      return () => clearTimeout(t)
    }
  }, [messages])

  const send = () => {
    const t = inputVal.trim(); if (!t) return
    handleSend(t); setInputVal('')
  }

  // When user picks an activity from the picker
  const handlePickActivity = (key) => {
    setShowPicker(false)
    setActiveActivity(key)
  }

  // When a bot message suggests an activity
  const handleSuggestedActivity = (key) => {
    setActiveActivity(key)
  }

  const handleConfirmLogout = async () => {
    try {
      await logout()
    } finally {
      setShowLogoutModal(false)
      navigate('/login')
    }
  }

  const glow = moodGlow[currentMood] || moodGlow.neutral

  const ActiveComp = activeActivity ? ACTIVITY_MAP[activeActivity]?.component : null
  const ActiveEntry = activeActivity ? ACTIVITY_MAP[activeActivity] : null

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
          <span className={styles.sessionLabel}>
            {currentUser ? `${currentUser.display_name} (account)` : 'session (local)'}
          </span>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.moodPill} style={{ borderColor:`${glow}44`, background:`${glow}10` }}>
            <span>{moodEmoji[currentMood]}</span>
            <span className={styles.moodPillLabel}>{moodLabel[currentMood] || 'Neutral'}</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Activity launcher */}
          <button
            className={`${styles.actLaunchBtn} ${showPicker ? styles.actLaunchBtnActive : ''}`}
            onClick={() => setShowPicker(p => !p)}
            title="Open an activity"
          >
            <span>✦</span>
            <span>Activities</span>
          </button>

          {/* Solid Logout button */}
          <button
            className={styles.solidLogoutBtn}
            onClick={() => setShowLogoutModal(true)}
            title="Log out from account or session"
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
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
                        <div className={styles.botBubbleMeta}>
                          {msg.mood && msg.mood!=='neutral' ? (
                            <span className={styles.moodTag}>{moodEmoji[msg.mood]} {msg.mood}</span>
                          ) : <span />}
                          {hasSpeechSynthesis && (
                            <button
                              type="button"
                              className={`${styles.voiceOutBtn} ${speakingId === msg.id ? styles.voiceOutActive : ''}`}
                              onClick={() => speakDirect(msg.id, msg.text)}
                              title={speakingId === msg.id ? "Stop reading" : "Read response aloud"}
                              aria-label="Voice out response"
                            >
                              {speakingId === msg.id ? (
                                <>
                                  <span className={styles.soundWaves}>
                                    <span /><span /><span />
                                  </span>
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                                  </svg>
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {msg.activity && (
                        <div className={styles.actSuggest}>
                          <p className={styles.actLead}>
                            Since you enjoy <strong>{msg.activity.interest}</strong> — {msg.activity.description}
                          </p>
                          <span className={styles.actHint}>✦ Choosing an activity for you…</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {msg.role === 'crisis' && (
                  <div className={styles.crisisBubble}>
                    <div className={styles.crisisHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🆘</span>
                        <span>Human support needed</span>
                      </div>
                      {hasSpeechSynthesis && (
                        <button
                          type="button"
                          className={`${styles.voiceOutBtn} ${styles.crisisVoiceOut} ${speakingId === msg.id ? styles.voiceOutActive : ''}`}
                          onClick={() => speakDirect(msg.id, msg.text)}
                          title={speakingId === msg.id ? "Stop voice" : "Read message aloud"}
                          aria-label="Voice out response"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <span className={styles.soundWaves}><span /><span /><span /></span>
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                              </svg>
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
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
                <div className={styles.typingDots}><span/><span/><span/></div>
              </div>
            )}
          </div>

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
              onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
              placeholder={isListening ? "Listening... speak into your microphone" : "Tell me how you're feeling…"}
              className={`${styles.input} ${isListening ? styles.inputListening : ''}`}
            />

            {/* Voice in (speech recognition) beside send button */}
            {hasSpeechRecognition && (
              <button
                type="button"
                className={`${styles.voiceInBtn} ${isListening ? styles.voiceInActive : ''}`}
                onClick={() => startListening(t => setInputVal(prev => prev ? `${prev} ${t}` : t))}
                title={isListening ? "Listening… click to stop" : "Voice input (Speak message)"}
                aria-label="Voice input"
              >
                {isListening ? (
                  <span style={{ fontSize: '1rem' }}>⏹</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
            )}

            <button className={styles.sendBtn} onClick={send} disabled={!inputVal.trim()} title="Send message">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Activity Picker modal ── */}
      {showPicker && (
        <ActivityPicker
          interests={interests}
          onSelect={handlePickActivity}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* ── Floating activity window ── */}
      {activeActivity && ActiveComp && (
        <FloatingWindow
          key={activeActivity}
          title={ActiveEntry.title}
          icon={ActiveEntry.icon}
          onClose={() => setActiveActivity(null)}
          initialPos={{ x: Math.max(40, window.innerWidth / 2 - 280), y: 80 }}
        >
          <div className={styles.floatBody}>
            <ActiveComp />
          </div>
        </FloatingWindow>
      )}

      {/* ── Logout confirmation modal ── */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        user={currentUser}
      />
    </div>
  )
}
