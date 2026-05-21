import { useState, useEffect } from 'react'
import ColorPicker from './ColorPicker'
import Yarnly from '../character/Yarnly'
import styles from './OpeningScene.module.css'

// phase:
//   'cradle'   — ニュートンのゆりかご表示
//   'falling'  — 選んだ玉が糸を切って落下
//   'born'     — キャラクター誕生（目・手・足が出る）
//   'wave'     — 手を振って自己紹介
//   'done'     — フェードアウト → 完了

export default function OpeningScene({ onComplete }) {
  const [phase,        setPhase]        = useState('cradle')
  const [selectedColor, setSelectedColor] = useState(null)
  const [showSpeech,   setShowSpeech]   = useState(false)
  const [fadeOut,      setFadeOut]      = useState(false)

  function handleColorSelect(yarnColor) {
    setSelectedColor(yarnColor)
    setPhase('falling')
  }

  // falling → born → wave の自動進行
  useEffect(() => {
    if (phase === 'falling') {
      const t = setTimeout(() => setPhase('born'), 700)
      return () => clearTimeout(t)
    }
    if (phase === 'born') {
      const t = setTimeout(() => setPhase('wave'), 500)
      return () => clearTimeout(t)
    }
    if (phase === 'wave') {
      const t1 = setTimeout(() => setShowSpeech(true), 400)
      const t2 = setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => onComplete(selectedColor.hex), 800)
      }, 3200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [phase])

  const action = phase === 'wave' ? 'wave' : 'idle'

  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ''}`}>

      {/* ニュートンのゆりかご */}
      {phase === 'cradle' && (
        <div className={styles.cradleArea}>
          <ColorPicker onSelect={handleColorSelect} />
        </div>
      )}

      {/* 落下アニメーション */}
      {phase === 'falling' && selectedColor && (
        <div className={styles.fallingArea}>
          <div className={styles.fallingBall} style={{ background: selectedColor.hex }} />
        </div>
      )}

      {/* キャラクター誕生・挨拶 */}
      {(phase === 'born' || phase === 'wave') && selectedColor && (
        <div className={styles.birthArea}>
          <div className={`${styles.characterWrap} ${phase === 'born' ? styles.popIn : ''}`}>
            {/* 吹き出し */}
            {showSpeech && (
              <div className={styles.speech}>
                僕はヤーンリー！<br />あなたの言葉を紡ぐよ
              </div>
            )}
            <Yarnly color={selectedColor.hex} action={action} size={65} />
          </div>
        </div>
      )}
    </div>
  )
}
