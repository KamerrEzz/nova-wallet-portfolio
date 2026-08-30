import { useCallback, useMemo, useRef } from 'react'
import type { PointerEvent, RefObject } from 'react'
import { useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export interface UseTiltOptions {
  /** Max rotation in degrees. */
  max?: number
  /** Scale while hovered. */
  scale?: number
  /** Show a moving glare overlay. */
  glare?: boolean
}

export interface UseTiltResult<T extends HTMLElement> {
  ref: RefObject<T>
  /** Motion style to spread on a `motion.*` card (rotateX/rotateY/scale). */
  style: MotionStyle
  /** Motion style for the glare overlay element. */
  glareStyle: MotionStyle
  /** Whether the glare overlay should be rendered. */
  glareEnabled: boolean
  onPointerMove: (event: PointerEvent<T>) => void
  onPointerEnter: (event: PointerEvent<T>) => void
  onPointerLeave: (event: PointerEvent<T>) => void
  handlers: {
    onPointerMove: (event: PointerEvent<T>) => void
    onPointerEnter: (event: PointerEvent<T>) => void
    onPointerLeave: (event: PointerEvent<T>) => void
  }
}

/**
 * 3D tilt that follows the pointer with spring smoothing.
 * Disabled entirely under `prefers-reduced-motion`.
 */
export function useTilt<T extends HTMLElement>(options: UseTiltOptions = {}): UseTiltResult<T> {
  const { max = 12, scale = 1.02, glare = true } = options
  const ref = useRef<T>(null)
  const reducedMotion = usePrefersReducedMotion()

  const pointerX = useMotionValue(0.5)
  const pointerY = useMotionValue(0.5)
  const hovering = useMotionValue(0)

  const springConfig = { stiffness: 260, damping: 22, mass: 0.6 }
  const smoothX = useSpring(pointerX, springConfig)
  const smoothY = useSpring(pointerY, springConfig)
  const smoothHover = useSpring(hovering, springConfig)

  const rotateX = useTransform(smoothY, [0, 1], [max, -max])
  const rotateY = useTransform(smoothX, [0, 1], [-max, max])
  const hoverScale = useTransform(smoothHover, [0, 1], [1, scale])

  const glareX = useTransform(smoothX, (v) => `${v * 100}%`)
  const glareY = useTransform(smoothY, (v) => `${v * 100}%`)
  const glareOpacity = useTransform(smoothHover, [0, 1], [0, 0.35])
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.9), transparent 60%)`

  const onPointerMove = useCallback(
    (event: PointerEvent<T>) => {
      const element = ref.current
      if (!element || reducedMotion) return
      const rect = element.getBoundingClientRect()
      pointerX.set((event.clientX - rect.left) / rect.width)
      pointerY.set((event.clientY - rect.top) / rect.height)
    },
    [pointerX, pointerY, reducedMotion],
  )

  const onPointerEnter = useCallback(() => {
    if (!reducedMotion) hovering.set(1)
  }, [hovering, reducedMotion])

  const onPointerLeave = useCallback(() => {
    hovering.set(0)
    pointerX.set(0.5)
    pointerY.set(0.5)
  }, [hovering, pointerX, pointerY])

  const style = useMemo<MotionStyle>(
    () =>
      reducedMotion
        ? {}
        : { rotateX, rotateY, scale: hoverScale, transformPerspective: 800 },
    [reducedMotion, rotateX, rotateY, hoverScale],
  )

  const glareEnabled = glare && !reducedMotion
  const glareStyle = useMemo<MotionStyle>(
    () => (glareEnabled ? { opacity: glareOpacity, background: glareBackground } : { opacity: 0 }),
    [glareEnabled, glareOpacity, glareBackground],
  )

  const handlers = useMemo(
    () => ({ onPointerMove, onPointerEnter, onPointerLeave }),
    [onPointerMove, onPointerEnter, onPointerLeave],
  )

  return { ref, style, glareStyle, glareEnabled, onPointerMove, onPointerEnter, onPointerLeave, handlers }
}
