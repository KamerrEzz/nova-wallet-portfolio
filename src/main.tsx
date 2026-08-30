import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './shared/theme/global.css'

async function bootstrap() {
  if (import.meta.env.DEV) {
    await import('@/mocks/browser').then((m) =>
      m.worker.start({ onUnhandledRequest: 'bypass' }),
    )
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
