import { useState, useRef, useEffect } from 'react'
import { TUTORIAL_BOTS } from '../constants/bots'
import { FLOW_SPEED_MS } from '../constants/config'

const BOT_SPEED = 0.055   // px per ms — crosses ~400px screen in ~7s
const BOW_DIST  = 80      // trigger bow when |botX - userX| < this (px)
const BOW_MS    = 1400    // bow duration (ms)

export function useEncounter({ submitCount, userX, sceneW }) {
  const [bot, setBot] = useState(null)

  const s = useRef({
    raf:          null,
    startTime:    0,
    startX:       0,
    endX:         0,
    bowEndTime:   0,
    bowTriggered: false,
    triggered:    false,
  }).current

  useEffect(() => {
    if (submitCount >= 2 && !s.triggered) {
      s.triggered = true
      const t = setTimeout(startBot, 1500)
      return () => clearTimeout(t)
    }
  }, [submitCount])  // eslint-disable-line react-hooks/exhaustive-deps

  function startBot() {
    const def  = TUTORIAL_BOTS.mumble
    const botW = 52
    s.startX       = -(botW + 20)
    s.endX         = (sceneW || window.innerWidth) + botW + 20
    s.startTime    = Date.now()
    s.bowTriggered = false
    s.bowEndTime   = 0

    setBot({ color: def.color, text: def.text, x: s.startX, revealCount: 0, isBowing: false, userIsBowing: false })
    s.raf = requestAnimationFrame(tick)
  }

  function tick() {
    const now     = Date.now()
    const elapsed = now - s.startTime
    const newX    = s.startX + elapsed * BOT_SPEED

    const revealCount = Math.min(
      Math.floor(elapsed / FLOW_SPEED_MS),
      TUTORIAL_BOTS.mumble.text.length
    )

    const uX = userX || window.innerWidth * 0.7
    if (!s.bowTriggered && Math.abs(newX - uX) < BOW_DIST) {
      s.bowTriggered = true
      s.bowEndTime   = now + BOW_MS
    }
    const isBowing = now < s.bowEndTime

    if (newX > s.endX) {
      s.raf = null
      setBot(null)
      return
    }

    setBot({ color: TUTORIAL_BOTS.mumble.color, text: TUTORIAL_BOTS.mumble.text, x: newX, revealCount, isBowing, userIsBowing: isBowing })
    s.raf = requestAnimationFrame(tick)
  }

  useEffect(() => () => { if (s.raf) cancelAnimationFrame(s.raf) }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return { bot }
}
