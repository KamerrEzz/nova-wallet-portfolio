import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { cn } from '@/shared/lib/cn'

import { removeToast, selectToasts } from './uiSlice'
import type { Toast } from './uiSlice'
import styles from './ToastViewport.module.css'

const AUTO_DISMISS_MS = 4000

export default function ToastViewport() {
  const toasts = useAppSelector(selectToasts)

  return (
    <div className={styles.viewport}>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch(removeToast(toast.id))
    }, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(styles.toast, styles[toast.kind])}
      role={toast.kind === 'error' ? 'alert' : 'status'}
    >
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.close}
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Cerrar notificación"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </motion.div>
  )
}
