import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '@/services/authService'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import Button from '@/components/ui/Button/Button'
import Orb from '@/components/ui/Orb/Orb'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/chat')
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Demo: skip login and go directly to chat
  const handleGuestContinue = () => navigate('/chat')

  return (
    <div className={styles.page}>
      {/* Background orb glow */}
      <div className={styles.bgOrb} aria-hidden="true" />

      <div className={styles.layout}>
        {/* Left panel — brand */}
        <div className={styles.brand}>
          <div className={styles.orbWrap}>
            <Orb mood="happy" size="large" />
          </div>
          <h1 className={styles.brandTitle}>MannMitra</h1>
          <p className={styles.brandSub}>
            An affect-aware companion that notices when you're not okay — and offers one small, personally relevant thing to do about it.
          </p>
          <div className={styles.brandFeatures}>
            {['Emotion-aware responses','Inline activities tailored to you','Crisis safety — always routes to a human','Nothing leaves your session without consent'].map(f => (
              <div key={f} className={styles.feature}>
                <span className={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className={styles.formSide}>
          <GlassCard padding="xl" className={styles.card}>
            {/* Logo mark */}
            <div className={styles.logoMark}>
              <span className={styles.logoDot} />
              <span className={styles.logoName}>MannMitra</span>
            </div>

            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Sign in to continue your session</p>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                </div>
                <PasswordInput
                  id="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <span className={styles.errorIcon}>⚠</span>
                  {error}
                </div>
              )}

              <Button
                variant="solid"
                size="lg"
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? <><span className={styles.spinner} />Signing in…</> : 'Sign in →'}
              </Button>
            </form>

            <div className={styles.divider}><span>or</span></div>

            <button className={styles.guestBtn} onClick={handleGuestContinue} type="button">
              Continue without account
            </button>

            <p className={styles.switchText}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.switchLink}>Create one</Link>
            </p>

            <p className={styles.privacyNote}>
              🔒 Sessions are in-memory only unless you opt in to logging. No data is shared without consent.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

/* Inline password visibility toggle */
function PasswordInput({ id, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.passwordWrap}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={styles.input}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="current-password"
        required
      />
      <button
        type="button"
        className={styles.eyeBtn}
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? '🙈' : '👁'}
      </button>
    </div>
  )
}
