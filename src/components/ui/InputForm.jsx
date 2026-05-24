import { useState, useRef, useEffect } from 'react'
import styles from './InputForm.module.css'

export default function InputForm({ onSubmit }) {
  const [text, setText] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const areaRef = useRef(null)
  const wrapRef = useRef(null)

  // Auto-resize: default 1 row, expand up to 5 rows
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineH = parseFloat(getComputedStyle(el).lineHeight) || 22.5
    const padV  = 18  // 9px top + 9px bottom
    const minH  = lineH + padV
    const maxH  = lineH * 5 + padV
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`
  }, [text])

  // Slide form above keyboard without touching layout height
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const el = wrapRef.current
    if (!el) return
    const onResize = () => {
      const keyboardH = window.innerHeight - vv.height
      el.style.transform = `translateY(-${Math.max(0, keyboardH)}px)`
    }
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [])

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  function insertNewline() {
    const el = areaRef.current
    if (!el) return
    const start = el.selectionStart
    const end   = el.selectionEnd
    setText(text.slice(0, start) + '\n' + text.slice(end))
    requestAnimationFrame(() => {
      el.setSelectionRange(start + 1, start + 1)
      el.focus()
    })
  }

  function onKeyDown(e) {
    // Enter always inserts a newline; submit only via button
  }

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={styles.areaWrap}>
        <textarea
          ref={areaRef}
          className={styles.area}
          value={text}
          onChange={e => setText(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={onKeyDown}
          placeholder="今、何を考えてる？"
          rows={1}
          maxLength={500}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="enter"
        />
        <button
          className={styles.newline}
          onClick={insertNewline}
          tabIndex={-1}
          title="改行 (Shift+Enter)"
          aria-label="改行"
        >
          ↵
        </button>
      </div>
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
