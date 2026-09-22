import styles from './GlassCard.module.css'

export default function GlassCard({ children, className='', hover=false, accent=false, alert=false, padding='md', as:Tag='div', ...props }) {
  const cls = [styles.card, hover&&styles.hover, accent&&styles.accent, alert&&styles.alert, styles[`p_${padding}`], className].filter(Boolean).join(' ')
  return <Tag className={cls} {...props}>{children}</Tag>
}
