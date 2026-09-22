import { useState } from 'react'
import { moodGlow, activityMap } from '@/lib/moodColors'
import { moodEmoji } from '@/lib/classifier'
import { HELPLINES } from '@/lib/constants'
import Button from '@/components/ui/Button/Button'
import styles from './MessageBubble.module.css'

export default function MessageBubble({ message, onOpenActivity }) {
  const { role, text, mood, activity, timestamp } = message
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (role === 'crisis') {
    return (
      <div className={styles.crisis}>
        <div className={styles.crisisHeader}>
          <span className={styles.crisisIcon}>🆘</span>
          <span className={styles.crisisTitle}>Human support needed</span>
        </div>
        <p className={styles.crisisText}>{text}</p>
        <div className={styles.helplines}>
          {HELPLINES.map(({ name, contact }) => (
            <div key={name} className={styles.helpline}>
              <span className={styles.helplineName}>{name}</span>
              <strong className={styles.helplineContact}>{contact}</strong>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (role === 'user') {
    return (
      <div className={styles.userWrap}>
        <div className={styles.user}>
          <p className={styles.userText}>{text}</p>
        </div>
        <time className={styles.time}>{time}</time>
      </div>
    )
  }

  // Bot message
  const glowColor = mood ? moodGlow[mood] : null

  return (
    <div className={styles.botWrap}>
      <div className={styles.avatar} style={glowColor ? { background: `radial-gradient(circle at 35% 30%, ${glowColor}, #0f111a 72%)`, boxShadow: `0 0 16px -4px ${glowColor}66` } : {}} aria-hidden="true">
        <span>M</span>
      </div>
      <div className={styles.botContent}>
        <div className={styles.bot}>
          <p className={styles.botText}>{text}</p>
          {mood && mood !== 'neutral' && (
            <div className={styles.moodTag}>
              {moodEmoji[mood]} detected: {mood}
            </div>
          )}
        </div>
        {activity && (
          <div className={styles.activitySuggest}>
            <div className={styles.activityLead}>
              Since you enjoy <strong>{activity.interest}</strong>, {activity.description?.toLowerCase() || 'want to try something?'}
            </div>
            <Button
              variant="solid"
              size="sm"
              onClick={() => onOpenActivity(activity)}
            >
              {activity.icon} {activity.label}
            </Button>
          </div>
        )}
        <time className={styles.time}>{time}</time>
      </div>
    </div>
  )
}
