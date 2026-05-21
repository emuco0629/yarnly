import NoroshiChar from './NoroshiChar'
import styles from './NoroshiCanvas.module.css'

// Full-scene overlay. chars already carry computed (x, y) in scene px.
export default function NoroshiCanvas({ chars, color }) {
  return (
    <div className={styles.canvas}>
      {chars.map(({ id, char, x, y }) => (
        <NoroshiChar key={id} char={char} color={color} x={x} y={y} />
      ))}
    </div>
  )
}
