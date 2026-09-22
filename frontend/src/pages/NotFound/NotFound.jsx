import { Link } from 'react-router-dom'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import Button from '@/components/ui/Button/Button'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <GlassCard padding="xl" className={styles.card}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p>This page doesn't exist — but MannMitra is still here if you need it.</p>
        <div className={styles.actions}>
          <Button variant="solid" as={Link} to="/">Go home</Button>
          <Button variant="outline" as={Link} to="/chat">Talk to Mitra</Button>
        </div>
      </GlassCard>
    </div>
  )
}
