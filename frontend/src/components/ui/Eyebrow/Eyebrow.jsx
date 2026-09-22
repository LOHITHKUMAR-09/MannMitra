import styles from './Eyebrow.module.css'
export default function Eyebrow({ children, className='' }) {
  return (
    <div className={`${styles.eyebrow} ${className}`}>
      <span className={styles.line} aria-hidden="true" />{children}
    </div>
  )
}
