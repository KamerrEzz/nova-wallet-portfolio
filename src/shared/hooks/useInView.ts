import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export interface UseInViewOptions extends IntersectionObserverInit {
  /** When true (default), stops observing after the first intersection. */
  once?: boolean
}

export interface UseInViewResult<T extends Element> {
  ref: RefObject<T>
  inView: boolean
}

/**
 * IntersectionObserver wrapper. Falls back to `inView: true` in environments
 * without IntersectionObserver (e.g. jsdom) so reveal animations still render.
 */
export function useInView<T extends Element>(options: UseInViewOptions = {}): UseInViewResult<T> {
  const { once = true, root = null, rootMargin, threshold } = options
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { root, rootMargin, threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once, root, rootMargin, threshold])

  return { ref, inView }
}
