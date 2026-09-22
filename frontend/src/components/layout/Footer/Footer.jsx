import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} wrap-wide`}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          <span className={styles.name}>MannMitra</span>
        </div>
        <nav className={styles.links} aria-label="Footer navigation">
          {[['chat','Companion'],['about','Framework'],['ethics','Ethics'],['references','References']].map(([path,label]) => (
            <Link key={path} to={`/${path}`}>{label}</Link>
          ))}
        </nav>
        <p className={styles.note}>
          An affect-aware companion · Built on Plutchik + Russell affect theory · No data leaves this session
        </p>
        <p className={styles.copy}>© {new Date().getFullYear()} MannMitra</p>
      </div>
    </footer>
  )
}
