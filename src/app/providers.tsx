import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { ThemeProvider } from '@/shared/theme/ThemeContext'

import { store } from './store'

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {/* All framer-motion animations respect prefers-reduced-motion. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ThemeProvider>
    </Provider>
  )
}
