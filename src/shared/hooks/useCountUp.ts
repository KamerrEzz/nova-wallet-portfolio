import { useEffect, useState } from 'react'

export interface UseCountUpOptions {
  /** Duration in seconds. */
  duration?: number
  /** Set false to hold at `target` without animating. */
  start?: boolean
}

/** Eased (easeOutCubic) count-up towards `target`, rAF based. */
export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
  const { duration = 1.2, start = true } = options
  const [value, setValue] = useState<number>(start ? 0 : target)

  useEffect(() => {
    if (!start) {
      setValue(target)
      return
    }

    let frame = 0
    const startTime = performance.now()
    const durationMs = duration * 1000

    const tick = (now: number) => {
      const t = durationMs > 0 ? Math.min(1, (now - startTime) / durationMs) : 1
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start])

  return value
}
