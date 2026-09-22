export const INTERESTS = [
  { id:'painting', label:'Painting',       icon:'🎨', defaultChecked: true  },
  { id:'music',    label:'Music',           icon:'🎵', defaultChecked: true  },
  { id:'gaming',   label:'Games',           icon:'🎮', defaultChecked: false },
  { id:'writing',  label:'Writing',         icon:'📖', defaultChecked: false },
  { id:'nature',   label:'Nature & Breath', icon:'🌿', defaultChecked: false },
]

export const TRY_CHIPS = [
  { label:'try: stressed', text:"I've been so stressed about my deadlines this week" },
  { label:'try: sad',      text:'honestly I feel kind of empty and low today' },
  { label:'try: happy',    text:"I'm actually feeling great today, everything's going well" },
  { label:'try: anxious',  text:"I can't stop worrying, my mind just keeps racing" },
  { label:'try: crisis ⚠', text:"I don't see the point anymore, I just want to end it all" },
]

export const JOURNAL_PROMPTS = [
  "What's one small thing that felt okay today, even if the rest didn't?",
  "If a friend told you they felt this way, what would you say to them?",
  "What's one thing you're carrying right now that you could put down for ten minutes?",
  "Describe a moment today when you felt most like yourself.",
  "What would help you feel 5% better right now?",
  "What are you grateful for, even in a small way?",
]

export const HELPLINES = [
  { name:'iCall (India)',         contact:'+91 9152987821' },
  { name:'Vandrevala Foundation', contact:'1860-2662-345'  },
  { name:'Emergency Services',    contact:'Your local emergency number' },
]

export const PENTATONIC_NOTES = [
  { label:'C',  freq:261.63, color:'#6fb8a8' },
  { label:'D',  freq:293.66, color:'#7fbf9e' },
  { label:'E',  freq:329.63, color:'#5fa8c9' },
  { label:'G',  freq:392.00, color:'#9c8fd1' },
  { label:'A',  freq:440.00, color:'#d9b54a' },
  { label:'C·', freq:523.25, color:'#6fb8a8' },
  { label:'D·', freq:587.33, color:'#7fbf9e' },
  { label:'E·', freq:659.25, color:'#5fa8c9' },
]

export const HERO_MOODS = ['contentment','curiosity','calm focus','quiet warmth','gentle awareness']

export const NAV_LINKS = [
  { to:'/about',      label:'Framework' },
  { to:'/evaluation', label:'Evaluation' },
  { to:'/ethics',     label:'Ethics' },
  { to:'/roadmap',    label:'Roadmap' },
  { to:'/references', label:'References' },
]
