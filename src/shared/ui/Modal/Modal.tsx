import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import styles from './Modal.module.css'

export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: ModalSize
  /** Close when clicking the blurred backdrop. Default true. */
  closeOnBackdrop?: boolean
  /** Hide the built-in close button. */
  hideCloseButton?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  hideCloseButton = false,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  // Focus the dialog on open, restore focus and body scroll on close.
  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (closeOnBackdrop && event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn(styles.dialog, styles[size], className)}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            {(title || !hideCloseButton) && (
              <div className={styles.header}>
                {title && (
                  <h2 className={styles.title} id={titleId}>
                    {title}
                  </h2>
                )}
                {!hideCloseButton && (
                  <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className={styles.body}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
