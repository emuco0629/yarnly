import { useState, useEffect, useRef } from 'react'
import Yarnly from '../character/Yarnly'
import NoroshiCanvas from '../noroshi/NoroshiCanvas'
import CeilingText from '../ui/CeilingText'
import HomeButton from '../ui/HomeButton'
import InputForm from '../ui/InputForm'
import { useNoroshi } from '../../hooks/useNoroshi'
import { useEncounter } from '../../hooks/useEncounter'
import styles from './WalkingScene.module.css'
import bgImg from '../../assets/yarnlyback1.png'

// Layout constants (px)
const GROUND_H      = 24   // bottom margin within canvas area (InputForm is now a separate flex row)
const YARNLY_H      = 58
const YARNLY_HALF   = 26
const CHAR_SP       = 20
const CHAR_GAP      = 30
const CEILING_Y     = 14   // canvas-relative threshold; chars above this enter the ceiling div
const CEIL_PAD      = 32
const CHAR_PX       = 14   // matches 14px ceiling font
const CEIL_CHAR_TOP = 10   // top of first ceiling line (below safe-area)
const CEIL_LINE_H   = 24   // px between ceiling text lines
const CEIL_LINES    = 5    // max ceiling lines to render
const CEIL_FADE_PAD = 24   // px at bottom for mask fade
const FONT_HALF     = 7    // half of 14px noroshi font — for thread endpoint centering

export default function WalkingScene({ color, onHome }) {
  const [entered,   setEntered]   = useState(false)
  const [viewportW, setViewportW] = useState(
    typeof window !== 'undefined' ? window.innerWidth  : 800
  )
  // Fixed on mount — never updated by keyboard open/close
  const [viewH, setViewH] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  )
  const sceneRef        = useRef(null)
  const botCeilStoreRef = useRef([])
  const [submitCount, setSubmitCount] = useState(0)
  const { chars, pushCount, addText, isFlowing, isAnimating } = useNoroshi()

  // sceneW computed early so useEncounter can receive it as a stable value each render
  const sceneW = sceneRef.current?.offsetWidth ?? viewportW
  const { bot } = useEncounter({ submitCount, userX: sceneW * 0.70, sceneW })

  useEffect(() => {
    // Capture layout height once. Only window.resize (orientation change) updates width.
    // visualViewport.resize (keyboard) is intentionally excluded to prevent layout jitter.
    setViewH(window.innerHeight)
    function onOrientationChange() {
      setViewportW(window.innerWidth)
    }
    window.addEventListener('resize', onOrientationChange)
    return () => window.removeEventListener('resize', onOrientationChange)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 1500)
    return () => clearTimeout(t)
  }, [])

  function handleSubmit(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    addText(trimmed)
    setSubmitCount(c => c + 1)
  }

  // ── Position calculation ──────────────────────────────────────────────────
  const sceneH = sceneRef.current?.offsetHeight ?? viewH
  const yarnlyX      = sceneW * 0.70
  const headY        = sceneH - GROUND_H - YARNLY_H
  const threadStartY = headY - CHAR_GAP

  // Bot noroshi: visible chars above bot's head in canvas coordinate space
  const botVisChars = bot ? Array.from({ length: bot.revealCount }, (_, i) => ({
    id: `bn-${i}`,
    char: bot.text[i],
    x: bot.x + Math.sin(i * 0.45) * 20,
    y: headY - CHAR_GAP - (bot.revealCount - 1 - i) * CHAR_SP,
  })).filter(c => c.y >= CEILING_Y) : []

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

  // Bot ceiling chars: lock entryX at the frame the char first enters ceiling
  const botStepsToReach = headY > 0 ? Math.ceil((headY - CHAR_GAP - CEILING_Y) / CHAR_SP) : 999
  const botCeilCount = bot ? Math.max(0, bot.revealCount - botStepsToReach) : 0
  if (bot && botCeilCount > botCeilStoreRef.current.length) {
    for (let i = botCeilStoreRef.current.length; i < botCeilCount; i++) {
      botCeilStoreRef.current.push({ id: `bc-${i}`, char: bot.text[i], color: bot.color, x: bot.x })
    }
  }

  // Ceiling: merge user + bot chars, show last CEIL_LINES lines
  const allCeilInputChars = [...ceilChars, ...botCeilStoreRef.current]
  const allCeilStr     = allCeilInputChars.map(c => c.char).join('')
  const completedLines = Math.floor(allCeilStr.length / lineLen)
  const startLine      = Math.max(0, completedLines - (CEIL_LINES - 1))
  const displayChars   = allCeilInputChars.slice(startLine * lineLen)
  const ceilDisplayChars = displayChars.map((c, i) => ({
    ...c,
    entryX:  c.x,
    targetX: CEIL_PAD / 2 + (i % lineLen) * CHAR_PX,
    targetY: CEIL_CHAR_TOP + Math.floor(i / lineLen) * CEIL_LINE_H,
  }))

  const ceilLineCount = displayChars.length > 0
    ? Math.ceil(displayChars.length / lineLen)
    : 0
  // Minimum height keeps the home button contained; expand per line of text
  const ceilH = Math.max(56, CEIL_CHAR_TOP + ceilLineCount * CEIL_LINE_H + CEIL_FADE_PAD)

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
      const ty = Math.max(c.y + FONT_HALF, -(CEIL_LINE_H + CEIL_FADE_PAD - FONT_HALF))
      pts.push(`L ${c.x.toFixed(1)} ${ty.toFixed(1)}`)
    })
    return pts.join(' ')
  })()

  // bow takes priority; else walk during entrance/animation
  const yarnlyAction = bot?.userIsBowing ? 'bow'
    : (!entered || isAnimating) ? 'walk'
    : 'idle'
  const animClass = !entered ? styles.entering
    : (isAnimating && !bot?.userIsBowing) ? styles.walking
    : ''

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.layout} style={{ height: viewH }}>
      <CeilingText chars={ceilDisplayChars} color={color} height={ceilH} />

      <div ref={sceneRef} className={styles.canvas}>
        <div
          className={`${styles.bgScroll}${(!entered || isAnimating || !!bot) ? ` ${styles.bgScrolling}` : ''}`}
          style={{ backgroundImage: `url(${bgImg})` }}
        />
        <HomeButton onHome={onHome} color={color} />

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

        {/* Bot Yarnly — enters from left, walks right (mirrored), renders behind user */}
        {bot && (
          <>
            <NoroshiCanvas chars={botVisChars} color={bot.color} />
            <div style={{
              position: 'absolute', bottom: GROUND_H,
              left: bot.x - YARNLY_HALF,
              transform: 'scaleX(-1)',
            }}>
              <Yarnly color={bot.color} action={bot.isBowing ? 'bow' : 'walk'} size={YARNLY_H} />
            </div>
          </>
        )}

        <div
          className={`${styles.character} ${animClass}`}
          style={{ left: `calc(70% - ${YARNLY_HALF}px)` }}
        >
          <Yarnly color={color} action={yarnlyAction} size={YARNLY_H} />
        </div>
      </div>

      <InputForm onSubmit={handleSubmit} />
    </div>
  )
}
