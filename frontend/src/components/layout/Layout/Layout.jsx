import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from '../Nav/Nav'
import Footer from '../Footer/Footer'
import styles from './Layout.module.css'

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  return (
    <div className={styles.root}>
      <Nav />
      <main className={styles.main}><Outlet /></main>
      <Footer />
    </div>
  )
}
