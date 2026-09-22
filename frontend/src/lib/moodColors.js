/** Emotion → CSS variable / hex color mappings */

export const moodColors = {
  happy:   'var(--calm)',
  sad:     'var(--wistful)',
  anxious: 'var(--tense)',
  angry:   'var(--heat)',
  stressed:'var(--slate)',
  neutral: 'var(--surface-3)',
  crisis:  'var(--alert)',
}

export const moodGlow = {
  happy:   '#6fb8a8',
  sad:     '#9c8fd1',
  anxious: '#d97a63',
  angry:   '#cf5a63',
  stressed:'#7c86a3',
  neutral: '#555d7a',
  crisis:  '#e4555f',
}

export const moodDim = {
  happy:   'var(--calm-dim)',
  sad:     'var(--wistful-dim)',
  anxious: 'var(--tense-dim)',
  angry:   'var(--heat-dim)',
  stressed:'var(--slate-dim)',
  neutral: 'rgba(85,93,122,0.14)',
  crisis:  'var(--alert-dim)',
}

export const activityMap = {
  painting: { label:'Open the Canvas',  key:'canvas',    icon:'🎨', description:'Express yourself with color and shape' },
  music:    { label:'Play some Notes',   key:'music',     icon:'🎵', description:'A pentatonic scale — no wrong notes' },
  gaming:   { label:'Memory Game',       key:'game',      icon:'🎮', description:'A gentle focus exercise' },
  writing:  { label:'Open the Journal',  key:'journal',   icon:'📖', description:'Write freely — stays only here' },
  nature:   { label:'Guided Breathing',  key:'breathing', icon:'🌿', description:'Settle the nervous system' },
}

export const botReplies = {
  happy:   "That's genuinely lovely to hear. Hold on to that feeling.",
  sad:     "That sounds heavy to carry. Thank you for trusting me with it.",
  anxious: "Sounds like a lot is spinning at once. That's an exhausting place to be.",
  angry:   "That frustration makes complete sense. Something pushed you today.",
  stressed:"That's a real amount of pressure to carry right now.",
  neutral: "Thanks for sharing. I'm here — tell me more whenever you'd like.",
}
