import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './FloatingWindow.module.css'

/**
 * Draggable, minimizable floating window.
 * Drag by the title bar. Stays within viewport.
 * Props: title, icon, onClose, children, initialPos {x,y}
 */
export default function FloatingWindow({ title, icon, onClose, children, initialPos }) {
  const [pos, setPos] = useState(initialPos || { x: 120, y: 100 })
  const [minimized, setMinimized] = useState(false)
  const [size, setSize] = useState({ w: 560, h: 440 })

  const dragging  = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const windowRef = useRef(null)

  // Clamp position inside viewport
  const clamp = useCallback((x, y) => {
    const el = windowRef.current
    if (!el) return { x, y }
    const vw = window.innerWidth,  vh = window.innerHeight
    const w  = el.offsetWidth,     h  = el.offsetHeight
    return {
      x: Math.max(0, Math.min(x, vw - w)),
      y: Math.max(0, Math.min(y, vh - h)),
    }
  }, [])

  const onMouseDown = (e) => {
    if (e.target.closest('button')) return
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      setPos(clamp(dragStart.current.px + dx, dragStart.current.py + dy))
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [clamp])

  // Touch support
  const onTouchStart = (e) => {
    const t = e.touches[0]
    dragging.current = true
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y }
  }
  useEffect(() => {
    const onTouchMove = (e) => {
      if (!dragging.current) return
      const t  = e.touches[0]
      const dx = t.clientX - dragStart.current.mx
      const dy = t.clientY - dragStart.current.my
      setPos(clamp(dragStart.current.px + dx, dragStart.current.py + dy))
      e.preventDefault()
    }
    const onTouchEnd = () => { dragging.current = false }
    window.addEventListener('touchmove',  onTouchMove, { passive: false })
    window.addEventListener('touchend',   onTouchEnd)
    return () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend',  onTouchEnd)
    }
  }, [clamp])

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${minimized ? styles.minimized : ''}`}
      style={{ left: pos.x, top: pos.y, width: minimized ? 'auto' : size.w }}
    >
      {/* Title bar */}
      <div
        className={styles.titleBar}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className={styles.titleLeft}>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.controls}>
          <button
            className={styles.ctrl}
            onClick={() => setMinimized(m => !m)}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? '⬜' : '─'}
          </button>
          <button
            className={`${styles.ctrl} ${styles.ctrlClose}`}
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <div className={styles.body} style={{ height: size.h }}>
          {children}
        </div>
      )}
    </div>
  )
}
