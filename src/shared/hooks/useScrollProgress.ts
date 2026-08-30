import { useEffect, useState } from 'react'

export interface ScrollProgress {
  /** 0–1 progress through the whole page. */
  progress: number
  /** Current window scroll offset in px. */
  scrollY: number
}

/** rAF-throttled page scroll progress. */
export function useScrollProgress(): ScrollProgress {
  const [state, setState] = useState<ScrollProgress>({ progress: 0, scrollY: 0 })

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const scrollY = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
      setState({ progress, scrollY })
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

  return state
}
