import { useState, useRef, useEffect } from 'react'
import { FLOW_SPEED_MS } from '../constants/config'

// All chars are added to state immediately on addText().
// The queue only carries timing entries ({at: ms}) that increment pushCount.
// If the RAF is throttled/paused, chars already exist in state and reappear correctly on resume.
export function useNoroshi() {
  const [chars,     setChars]     = useState([])
  const [pushCount, setPushCount] = useState(0)
  const [isFlowing, setIsFlowing] = useState(false)

  const s = useRef({
    nextId:           0,
    globalIdx:        0,
    currentPushCount: 0,  // mutable shadow of pushCount — updated synchronously in tick
    raf:              null,
    queue:            [],   // { at: ms } — only timing, no char data
    queueEnd:         Date.now(),
    tick:             null,
  }).current

  useEffect(() => {
    function tick() {
      const now = Date.now()
      let i = 0
      while (i < s.queue.length && s.queue[i].at <= now) i++

      if (i > 0) {
        s.queue = s.queue.slice(i)
        s.currentPushCount += i
        setPushCount(prev => prev + i)
      }

      if (s.queue.length > 0) {
        s.raf = requestAnimationFrame(tick)
      } else {
        s.raf = null
        setIsFlowing(false)
      }
    }

    s.tick = tick

    // Restart RAF when tab becomes visible after being hidden
    function onVisible() {
      if (!document.hidden && s.queue.length > 0 && !s.raf) {
        setIsFlowing(true)
        s.raf = requestAnimationFrame(s.tick)
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (s.raf) cancelAnimationFrame(s.raf)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function addText(text) {
    if (s.raf) { cancelAnimationFrame(s.raf); s.raf = null }

    const now     = Date.now()
    const startAt = Math.max(now + 16, s.queueEnd)
    const n       = text.length

    // Start new chars at currentPushCount so the first char always appears at Yarnly's head.
    // Using globalIdx alone would place chars below pushCount immediately (all revealed at once,
    // high up the column) when virtualSteps from prior submissions have pushed pushCount ahead.
    const startIdx = Math.max(s.currentPushCount, s.globalIdx)
    setChars(prev => [
      ...prev,
      ...text.split('').map((char, i) => ({
        id:   s.nextId++,
        char,
        idx:  startIdx + i,
      })),
    ])
    s.globalIdx = startIdx + n

    // Queue = timing entries only (pushCount increments)
    const maxVis       = Math.floor((window.innerHeight - 64 - 90 - 24 - 56) / 22)
    const virtualSteps = Math.max(maxVis + 6, 10)
    const textEndAt    = startAt + n * FLOW_SPEED_MS

    const newItems = []
    for (let i = 0; i < n; i++)            newItems.push({ at: startAt + i * FLOW_SPEED_MS })
    for (let i = 0; i < virtualSteps; i++) newItems.push({ at: textEndAt + i * FLOW_SPEED_MS })

    s.queue    = [...s.queue, ...newItems]
    s.queueEnd = textEndAt + virtualSteps * FLOW_SPEED_MS

    setIsFlowing(true)
    s.raf = requestAnimationFrame(s.tick)
  }

  return { chars, pushCount, addText, isFlowing }
}
