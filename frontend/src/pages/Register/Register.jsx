import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '@/services/authService'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import Button from '@/components/ui/Button/Button'
import styles from './Register.module.css'

const INTERESTS_OPTIONS = [
  { id:'painting', label:'Painting',       icon:'🎨' },
  { id:'music',    label:'Music',           icon:'🎵' },
  { id:'gaming',   label:'Games',           icon:'🎮' },
  { id:'writing',  label:'Writing',         icon:'📖' },
  { id:'nature',   label:'Nature & Breath', icon:'🌿' },
]

const STEPS = ['Account', 'Interests', 'Done']

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' })
  const [interests, setInterests] = useState(['painting', 'music'])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validateStep0 = () => {
    if (!form.displayName.trim()) return 'Please enter your name.'
    if (!form.email.includes('@')) return 'Please enter a valid email.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return ''
  }

  const nextStep = () => {
    setError('')
    if (step === 0) {
      const err = validateStep0()
      if (err) { setError(err); return }
    }
    setStep(s => s + 1)
  }

  const toggleInterest = (id) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName)
      setStep(2) // success
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.detail || 'Registration failed. Please try again.')
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step === 0) nextStep()
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} aria-hidden="true" />

      <div className={styles.container}>
        <GlassCard padding="xl" className={styles.card}>
          {/* Logo */}
          <div className={styles.logoMark}>
            <span className={styles.logoDot} />
            <span className={styles.logoName}>MannMitra</span>
          </div>

          {/* Step indicator */}
          <div className={styles.steps}>
            {STEPS.map((label, i) => (
              <div key={label} className={`${styles.step} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepDot}>
                  {i < step ? '✓' : <span>{i + 1}</span>}
                </div>
                <span className={styles.stepLabel}>{label}</span>
                {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
              </div>
            ))}
          </div>

          {/* Step 0 — Account details */}
          {step === 0 && (
            <div className={styles.stepContent} onKeyDown={handleKeyDown}>
              <h2 className={styles.title}>Create your account</h2>
              <p className={styles.subtitle}>Takes less than a minute</p>
              <div className={styles.form}>
                <Field label="Your name" id="name">
                  <input
                    id="name"
                    type="text"
                    className={styles.input}
                    value={form.displayName}
                    onChange={set('displayName')}
                    placeholder="What should Mitra call you?"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email address" id="email">
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Password" id="password">
                  <PasswordInput
                    id="password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    styles={styles}
                  />
                </Field>
                <Field label="Confirm password" id="confirm">
                  <PasswordInput
                    id="confirm"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    styles={styles}
                  />
                </Field>
                {error && <ErrorBox error={error} styles={styles} />}
                <Button variant="solid" size="lg" className={styles.fullBtn} onClick={nextStep}>
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {/* Step 1 — Interests */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.title}>What do you enjoy?</h2>
              <p className={styles.subtitle}>
                Mitra uses this to suggest activities that feel personally meaningful when your mood dips.
                You can change this any time in the chat.
              </p>
              <div className={styles.interestGrid}>
                {INTERESTS_OPTIONS.map(({ id, label, icon }) => {
                  const checked = interests.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.interestCard} ${checked ? styles.interestChecked : ''}`}
                      onClick={() => toggleInterest(id)}
                      aria-pressed={checked}
                    >
                      <span className={styles.interestIcon}>{icon}</span>
                      <span className={styles.interestLabel}>{label}</span>
                      {checked && <span className={styles.interestCheck}>✓</span>}
                    </button>
                  )
                })}
              </div>
              <p className={styles.interestHint}>Select at least one interest</p>
              {error && <ErrorBox error={error} styles={styles} />}
              <div className={styles.btnRow}>
                <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
                <Button variant="solid" size="lg" disabled={loading || interests.length === 0} onClick={handleSubmit} className={styles.flexBtn}>
                  {loading ? <><span className={styles.spinner} />Creating account…</> : 'Create account →'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Success */}
          {step === 2 && (
            <div className={`${styles.stepContent} ${styles.successPanel}`}>
              <div className={styles.successOrb}>🌟</div>
              <h2 className={styles.title}>Welcome, {form.displayName}!</h2>
              <p className={styles.subtitle}>Your account has been created. Mitra is ready whenever you are.</p>
              <Button variant="solid" size="lg" className={styles.fullBtn} onClick={() => navigate('/chat')}>
                Open companion →
              </Button>
            </div>
          )}

          {step < 2 && (
            <p className={styles.switchText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.switchLink}>Sign in</Link>
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

function Field({ label, id, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
      <label htmlFor={id} style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-dim)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete, styles }) {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.passwordWrap}>
      <input id={id} type={show ? 'text' : 'password'} className={styles.input}
        value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={autoComplete} />
      <button type="button" className={styles.eyeBtn}
        onClick={() => setShow(s => !s)} aria-label={show ? 'Hide' : 'Show'}>
        {show ? '🙈' : '👁'}
      </button>
    </div>
  )
}

function ErrorBox({ error, styles }) {
  return (
    <div className={styles.errorBox} role="alert">
      <span>⚠</span>{error}
    </div>
  )
}
