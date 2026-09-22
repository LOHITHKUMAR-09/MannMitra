import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { NAV_LINKS } from '@/lib/constants'
import styles from './Nav.module.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const h = () => { if (window.innerWidth > 820) setOpen(false) }
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  // prevent scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} aria-label="Main navigation">
      <div className={`${styles.inner} wrap-wide`}>
        <Link to="/" className={styles.brand} aria-label="MannMitra home" onClick={() => setOpen(false)}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.name}>MannMitra</span>
        </Link>

        <ul className={`${styles.links} ${open ? styles.open : ''}`} role="list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <Link to="/login" className={styles.cta} onClick={() => setOpen(false)}>
              Talk now ↗
            </Link>
          </li>
        </ul>

        <button
          className={`${styles.ham} ${open ? styles.hamOpen : ''}`}
          onClick={() => setOpen(p => !p)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span /><span /><span />
        </button>
      </div>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
    </nav>
  )
}
