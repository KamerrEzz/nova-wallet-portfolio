import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import styles from './CommandPalette.module.css'

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  action: () => void
  keywords?: string[]
}

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  items: CommandItem[]
  placeholder?: string
  className?: string
}

/** Case-insensitive subsequence match; returns a score (lower is better) or -1 for no match. */
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  const direct = t.indexOf(q)
  if (direct !== -1) return direct

  let qi = 0
  let score = 0
  let last = -2
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += ti - last > 1 ? ti : 0
      last = ti
      qi++
    }
  }
  return qi === q.length ? score + 100 : -1
}

export function CommandPalette({
  open,
  onClose,
  items,
  placeholder = 'Type a command or search...',
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return items
    return items
      .map((item) => {
        const scores = [
          fuzzyScore(q, item.label),
          item.description ? fuzzyScore(q, item.description) + 50 : -1,
          ...(item.keywords ?? []).map((k) => fuzzyScore(q, k) + 25),
        ].filter((s) => s !== -1)
        return { item, score: scores.length ? Math.min(...scores) : -1 }
      })
      .filter((entry) => entry.score !== -1)
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.item)
  }, [items, query])

  // Reset state on open; lock body scroll; focus the input.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Keep the active item within the visible list.
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, filtered])

  const runItem = (item: CommandItem) => {
    onClose()
    item.action()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = filtered[activeIndex]
      if (item) runItem(item)
    } else if (event.key === 'Escape') {
      onClose()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className={cn(styles.panel, className)}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className={styles.inputRow}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={filtered[activeIndex] ? `command-${filtered[activeIndex].id}` : undefined}
                className={styles.input}
                placeholder={placeholder}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={onKeyDown}
              />
              <kbd className={styles.kbd}>Esc</kbd>
            </div>
            <ul ref={listRef} id="command-list" role="listbox" className={styles.list}>
              {filtered.length === 0 && <li className={styles.empty}>No results found</li>}
              {filtered.map((item, index) => (
                <li
                  key={item.id}
                  id={`command-${item.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(styles.item, index === activeIndex && styles.itemActive)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runItem(item)}
                >
                  {item.icon && (
                    <span className={styles.itemIcon} aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className={styles.itemText}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.description && <span className={styles.itemDescription}>{item.description}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
