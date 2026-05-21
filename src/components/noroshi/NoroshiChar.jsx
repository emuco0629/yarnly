import styles from './NoroshiChar.module.css'

// Rendered at absolute (x, y) in scene coordinates.
// x/y are set by parent; this component only handles appearance.
export default function NoroshiChar({ char, color, x, y }) {
  return (
    <div className={styles.anchor} style={{ left: x, top: y }}>
      <span className={styles.glyph} style={{ color }}>
        {char}
      </span>
    </div>
  )
}
