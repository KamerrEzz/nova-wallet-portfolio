import { useMediaQuery } from './useMediaQuery'

/** True when the user requested reduced motion at the OS level. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
