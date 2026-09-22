/**
 * MannMitra — Lexicon-based affect classifier
 * Local fallback used when FastAPI backend is unavailable.
 * Production: POST /api/mood/classify
 */

export const MOODS = {
  HAPPY:   'happy',
  SAD:     'sad',
  ANXIOUS: 'anxious',
  ANGRY:   'angry',
  STRESSED:'stressed',
  NEUTRAL: 'neutral',
  CRISIS:  'crisis',
}

const lex = {
  crisis: [
    'suicide','kill myself','want to die','end it all','end my life',
    'no reason to live','self harm','hurt myself','better off dead',
    'not worth living','take my own life','wish i was dead',"can't go on",
    "don't want to be here",'rather be dead','worthless and hopeless',
  ],
  happy: [
    'happy','great','good','joy','excited','awesome','glad','fantastic',
    'wonderful','amazing','grateful','love','well','blessed','cheerful',
    'delighted','thrilled','content','peaceful','elated','enjoying',
  ],
  sad: [
    'sad','down','depressed','lonely','empty','hopeless','cry','miserable',
    'heartbroken','low','numb','grief','broken','tearful','unhappy',
    'gloomy','melancholy','sorrowful','devastated','feel nothing',
  ],
  anxious: [
    'anxious','nervous','worried','scared','afraid','panic','overwhelmed',
    'tense','restless','anxiety','fear','dread','uneasy','apprehensive',
    'jittery','on edge','freaking out',"can't stop thinking",'racing mind',
  ],
  angry: [
    'angry','mad','furious','frustrated','annoyed','irritated','rage',
    'hate','pissed','livid','outraged','infuriated','bitter','hostile','sick of',
  ],
  stressed: [
    'stressed','stress','pressure','exhausted','tired','burnt out','burnout',
    'overloaded','deadline','deadlines','swamped','so much to do',
    "can't cope",'struggling','barely managing','no time','drained',
  ],
}

/**
 * @param {string} text
 * @returns {'happy'|'sad'|'anxious'|'angry'|'stressed'|'neutral'|'crisis'}
 */
export function classify(text) {
  const t = ' ' + text.toLowerCase() + ' '
  for (const phrase of lex.crisis) {
    if (t.includes(phrase)) return MOODS.CRISIS
  }
  const scores = { happy: 0, sad: 0, anxious: 0, angry: 0, stressed: 0 }
  for (const [cat, words] of Object.entries(lex)) {
    if (cat === 'crisis') continue
    for (const word of words) {
      if (t.includes(word)) scores[cat]++
    }
  }
  let best = MOODS.NEUTRAL, bestScore = 0
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) { best = cat; bestScore = score }
  }
  return best
}

export const moodEmoji = {
  happy:'🌟', sad:'🌧', anxious:'🌀', angry:'🔥',
  stressed:'⚡', neutral:'◎', crisis:'🆘',
}

export const moodLabel = {
  happy:   'Content & Joyful',
  sad:     'Feeling Low',
  anxious: 'Anxious',
  angry:   'Frustrated',
  stressed:'Under Pressure',
  neutral: 'Neutral',
  crisis:  'Crisis — Human needed',
}
