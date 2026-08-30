import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export interface UseElementScrollProgressResult<T extends Element> {
  ref: RefObject<T>
  /** 0 when the element's top enters the viewport bottom, 1 when its bottom leaves the viewport top. */
  progress: number
}

/** Progress (0–1) of an element travelling through the viewport — for parallax. */
export function useElementScrollProgress<T extends Element>(): UseElementScrollProgressResult<T> {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const total = viewportHeight + rect.height
      const raw = total > 0 ? (viewportHeight - rect.top) / total : 0
      setProgress(Math.min(1, Math.max(0, raw)))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return { ref, progress }
}
