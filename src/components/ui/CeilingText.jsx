import styles from './CeilingText.module.css'

// Renders current ceiling line as individually positioned chars.
// Each char slides from its vertical column x (entryX) to its text position (targetX).
export default function CeilingText({ chars, color }) {
  if (!chars || chars.length === 0) return null
  return (
    <div className={styles.ceiling}>
      {chars.map(c => (
        <span
          key={c.id}
          className={styles.char}
          style={{
            color,
            left: c.targetX,
            '--char-top':  `${c.targetY}px`,
            '--from-dx': `${(c.entryX - c.targetX).toFixed(1)}px`,
          }}
        >
          {c.char}
        </span>
      ))}
    </div>
  )
}
