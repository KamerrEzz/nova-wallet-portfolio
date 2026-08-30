import { useEffect, useRef } from 'react'

/**
 * Returns a ref for the step heading and moves focus to it when the step
 * mounts, so keyboard and screen-reader users land on the new step.
 */
export function useFocusHeading<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return ref
}
