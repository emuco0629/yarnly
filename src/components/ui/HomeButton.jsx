import styles from './HomeButton.module.css'

export default function HomeButton({ onHome }) {
  return (
    <button className={styles.btn} onClick={onHome} aria-label="ホームに戻る">
      🏠
    </button>
  )
}
