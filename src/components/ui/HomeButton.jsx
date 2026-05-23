import styles from './HomeButton.module.css'

export default function HomeButton({ onHome, color }) {
  return (
    <button className={styles.btn} onClick={onHome} aria-label="ホームに戻る">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill={color || '#888'}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    </button>
  )
}
