import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useInView, usePrefersReducedMotion } from '@/shared/hooks'

export interface RevealProps {
  children: ReactNode
  /** Stagger delay in seconds. */
  delay?: number
  className?: string
}

/**
 * Scroll-reveal wrapper: springs content up when it enters the viewport.
 * Under reduced motion (or without IntersectionObserver) renders fully visible.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay }}
    >
      {children}
    </motion.div>
  )
}
