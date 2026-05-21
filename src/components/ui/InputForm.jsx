import { useState, useRef, useEffect } from 'react'
import styles from './InputForm.module.css'

export default function InputForm({ onSubmit }) {
  const [text, setText] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const areaRef = useRef(null)
  const wrapRef = useRef(null)

  // Auto-resize textarea: min 2 rows, max 4 rows
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineH = parseFloat(getComputedStyle(el).lineHeight) || 22.5
    const minH  = lineH * 2 + 18
    const maxH  = lineH * 4 + 28
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`
  }, [text])

  // Keep form above keyboard using visualViewport API
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const el = wrapRef.current
    if (!el) return

    function update() {
      // How far the visual viewport's bottom is from the layout viewport's bottom
      const offset = window.innerHeight - vv.offsetTop - vv.height
      el.style.bottom = `${Math.max(0, offset)}px`
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <textarea
        ref={areaRef}
        className={styles.area}
        value={text}
        onChange={e => setText(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={onKeyDown}
        placeholder="今、何を考えてる？"
        rows={2}
        maxLength={500}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        enterKeyHint="send"
      />
      <button
        className={styles.send}
        onClick={submit}
        disabled={!text.trim()}
        aria-label="送信"
      >
        ↑
      </button>
    </div>
  )
}
