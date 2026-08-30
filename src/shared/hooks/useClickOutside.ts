import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * Invokes `onOutside` for pointer interactions outside the referenced element.
 * Attach the returned ref to the container that should be "inside".
 */
export function useClickOutside<T extends HTMLElement>(
  onOutside: (event: MouseEvent | TouchEvent) => void,
): RefObject<T> {
  const ref = useRef<T>(null)
  const handlerRef = useRef(onOutside)

  useEffect(() => {
    handlerRef.current = onOutside
  }, [onOutside])

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      if (!element || element.contains(event.target as Node)) return
      handlerRef.current(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [])

  return ref
}
