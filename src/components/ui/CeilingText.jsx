import styles from './CeilingText.module.css'

// Renders ceiling lines as individually positioned chars.
// height: base px (env(safe-area-inset-top) added via CSS calc).
export default function CeilingText({ chars, color, height }) {
  return (
    <div
      className={styles.ceiling}
      style={{ height: `calc(${height}px + env(safe-area-inset-top, 0px))` }}
    >
      {chars && chars.map(c => (
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
