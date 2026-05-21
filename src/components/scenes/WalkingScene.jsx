import { useState, useEffect, useRef } from 'react'
import Yarnly from '../character/Yarnly'
import NoroshiCanvas from '../noroshi/NoroshiCanvas'
import CeilingText from '../ui/CeilingText'
import HomeButton from '../ui/HomeButton'
import InputForm from '../ui/InputForm'
import { useNoroshi } from '../../hooks/useNoroshi'
import styles from './WalkingScene.module.css'

// Layout constants (px)
const GROUND_H      = 88
const YARNLY_H      = 58
const YARNLY_HALF   = 26
const CHAR_SP       = 20
const CHAR_GAP      = 30
const CEILING_Y     = 48
const CEIL_PAD      = 32
const CHAR_PX       = 14   // matches 14px ceiling font
const CEIL_CHAR_TOP = 20
const FONT_HALF     = 7    // half of 14px noroshi font — for thread endpoint centering

export default function WalkingScene({ color, onHome }) {
  const [entered,   setEntered]   = useState(false)
  const [viewportW, setViewportW] = useState(
    typeof window !== 'undefined' ? window.innerWidth  : 800
  )
  const [viewportH, setViewportH] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  )
  const sceneRef = useRef(null)
  const { chars, pushCount, addText, isFlowing } = useNoroshi()

  useEffect(() => {
    function update() {
      setViewportW(window.innerWidth)
      // Use actual scene offsetHeight so 100dvh ≠ window.innerHeight on mobile is handled
      setViewportH(sceneRef.current?.offsetHeight ?? window.innerHeight)
    }
    window.addEventListener('resize', update)
    // Fires when keyboard shows/hides on mobile
    window.visualViewport?.addEventListener('resize', update)
    update() // Measure after mount
    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 1500)
    return () => clearTimeout(t)
  }, [])

  function handleSubmit(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    addText(trimmed)
  }

  // ── Position calculation ──────────────────────────────────────────────────
  const sceneW       = sceneRef.current?.offsetWidth  ?? viewportW
  const sceneH       = sceneRef.current?.offsetHeight ?? viewportH
  const yarnlyX      = sceneW * 0.70
  const headY        = sceneH - GROUND_H - YARNLY_H
  const threadStartY = headY - CHAR_GAP

  const lineLen = Math.max(10, Math.floor((sceneW - CEIL_PAD) / CHAR_PX))

  // posChars: compute positions for ALL chars, then filter to revealed only (idx < pushCount).
  // Unrevealed chars exist in state but must not be rendered or affect layout.
  const posChars = chars
    .filter(c => c.idx < pushCount)
    .map(c => {
      const y = threadStartY - (pushCount - 1 - c.idx) * CHAR_SP
      const x = yarnlyX + Math.sin(c.idx * 0.45) * 20
      return { ...c, x, y }
    })

  const visChars  = posChars.filter(c => c.y >= CEILING_Y)
  const ceilChars = posChars.filter(c => c.y < CEILING_Y)

  // Ceiling: current partial line only
  const allCeilStr           = ceilChars.map(c => c.char).join('')
  const completedLines       = Math.floor(allCeilStr.length / lineLen)
  const currentLineCeilChars = ceilChars.slice(completedLines * lineLen)
  const ceilDisplayChars     = currentLineCeilChars.map((c, i) => ({
    ...c,
    entryX:  c.x,
    targetX: CEIL_PAD / 2 + i * CHAR_PX,
    targetY: CEIL_CHAR_TOP,
  }))

  // Thread: simple M...L path from Yarnly's head through centers of last 3–4 chars.
  // Use posChars (not visChars) so the thread stays visible even when accumulated
  // virtual-step pushCount pushes recent chars above CEILING_Y on the 3rd+ submit.
  // Y endpoint is clamped to CEILING_Y so the thread never extends above the ceiling overlay.
  const recentChars = [...posChars]
    .sort((a, b) => b.idx - a.idx)
    .slice(0, 2)

  const threadD = (() => {
    if (recentChars.length === 0) return ''
    const pts = [`M ${yarnlyX.toFixed(1)} ${headY}`]
    recentChars.forEach(c => {
      const ty = Math.max(c.y + FONT_HALF, CEILING_Y)
      pts.push(`L ${c.x.toFixed(1)} ${ty.toFixed(1)}`)
    })
    return pts.join(' ')
  })()

  // Walking: legs move during entrance AND while chars are flowing
  const yarnlyAction = (!entered || isFlowing) ? 'walk' : 'idle'
  const animClass    = !entered
    ? styles.entering
    : isFlowing ? styles.walking : ''

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={sceneRef} className={styles.scene}>
      <HomeButton onHome={onHome} />
      <CeilingText chars={ceilDisplayChars} color={color} />

      {/* Thread: head → centers of last 3–4 chars, straight lines only */}
      {threadD && (
        <svg style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          overflow: 'visible', pointerEvents: 'none', zIndex: 4,
        }}>
          <path
            d={threadD}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.35"
            style={{ filter: 'blur(0.5px)' }}
          />
        </svg>
      )}

      <NoroshiCanvas chars={visChars} color={color} />

      <div className={styles.ground} />

      <div
        className={`${styles.character} ${animClass}`}
        style={{ left: `calc(70% - ${YARNLY_HALF}px)` }}
      >
        <Yarnly color={color} action={yarnlyAction} size={YARNLY_H} />
      </div>

      <InputForm onSubmit={handleSubmit} />
    </div>
  )
}
