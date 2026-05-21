import { useState, useRef, useEffect } from 'react'
import { YARN_COLORS } from '../../constants/colors'
import yarnSvg from '../../assets/yarn.svg'
import styles from './ColorPicker.module.css'

const BALL_R     = 17
const LONG_PRESS = 650
const HINT_TEXT  = '好きな色を長押しして選んでね'

function YarnBall({ color, r }) {
  return (
    <div style={{
      width: r * 2,
      height: r * 2,
      background: color,
      WebkitMaskImage: `url(${yarnSvg})`,
      maskImage: `url(${yarnSvg})`,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }} />
  )
}

export default function ColorPicker({ onSelect }) {
  const [hoverIdx,   setHoverIdx]   = useState(null)
  const [cuttingIdx, setCuttingIdx] = useState(null)
  const timerRefs = useRef({})

  useEffect(() => () => {
    Object.values(timerRefs.current).forEach(clearTimeout)
  }, [])

  function onPointerEnter(idx) {
    if (cuttingIdx !== null) return
    setHoverIdx(idx)
  }

  function onPointerLeave(idx) {
    clearTimeout(timerRefs.current[idx])
    timerRefs.current[idx] = null
    setHoverIdx(null)
  }

  function onPointerDown(idx) {
    if (cuttingIdx !== null) return
    timerRefs.current[idx] = setTimeout(() => {
      setCuttingIdx(idx)
      setHoverIdx(null)
      setTimeout(() => onSelect(YARN_COLORS[idx]), 380)
    }, LONG_PRESS)
  }

  function onPointerUp(idx) {
    clearTimeout(timerRefs.current[idx])
    timerRefs.current[idx] = null
  }

  const stringHeight = `calc(72dvh - ${BALL_R * 2}px)`

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      justifyContent: 'center',
      userSelect: 'none',
      width: '100%',
    }}>
      {YARN_COLORS.map((yc, idx) => {
        const isHovering = hoverIdx === idx
        const isCutting  = cuttingIdx === idx

        // 揺れの強さと遅延（hoverIdx から距離で減衰）
        const distance = (hoverIdx !== null && cuttingIdx === null)
          ? Math.abs(idx - hoverIdx)
          : Infinity
        const swayAmp   = distance === 0 ? 6 : distance === 1 ? 3 : distance === 2 ? 1.5 : 0
        const swayDelay = distance === 0 ? 0 : distance === 1 ? 0.14 : 0.24

        return (
          <div
            key={yc.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              touchAction: 'none',
            }}
            onPointerEnter={() => onPointerEnter(idx)}
            onPointerLeave={() => onPointerLeave(idx)}
            onPointerDown={() => onPointerDown(idx)}
            onPointerUp={() => onPointerUp(idx)}
          >
            {/* 糸 */}
            <div
              className={isCutting ? styles.stringCutting : undefined}
              style={{
                width: 2,
                height: stringHeight,
                position: 'relative',
              }}
            >
              {/* 糸の見た目（テキストと分離してぼかし・透明度を適用） */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: yc.hex,
                filter: 'blur(0.5px)',
                opacity: 0.7,
              }} />
              {isHovering && (
                <div
                  className={styles.textOnString}
                  style={{ color: yc.hex, bottom: 4 }}
                >
                  {HINT_TEXT.split('').map((char, i, arr) => (
                    <span
                      key={i}
                      className={styles.textChar}
                      style={{ animationDelay: `${(arr.length - 1 - i) * 0.04}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 毛糸玉（揺れ＋目） */}
            <div
              className={[
                isCutting ? styles.ballFalling : undefined,
                swayAmp > 0 ? styles.swaying : undefined,
              ].filter(Boolean).join(' ')}
              style={{
                position: 'relative',
                '--sway-amp': `${swayAmp}px`,
                '--sway-delay': `${swayDelay}s`,
              }}
            >
              <YarnBall color={yc.hex} r={BALL_R} />
              {isHovering && (
                <div className={styles.eyesOverlay}>
                  <span className={styles.eye} />
                  <span className={styles.eye} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
