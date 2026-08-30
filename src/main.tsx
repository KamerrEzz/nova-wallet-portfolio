import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { router } from './app/router'
import './shared/theme/global.css'

/**
 * GitHub Pages SPA redirect.
 *
 * GitHub Pages returns its own 404.html for deep links. That file stores the
 * original path in `?redirect=` and reloads the app at the root. Here we
 * restore the original route once React Router is ready.
 */
const redirect = new URLSearchParams(window.location.search).get('redirect')
if (redirect) {
  // Remove the ?redirect= query string so the URL looks clean.
  window.history.replaceState(null, '', window.location.pathname)
}

async function bootstrap() {
  // MSW runs in dev and in this production demo so the mocked BFF is available everywhere.
  if (import.meta.env.DEV || import.meta.env.PROD) {
    const { worker } = await import('@/mocks/browser')
    try {
      await worker.start({
        // Relative URL works both at `/mockServiceWorker.js` (dev) and
        // `/repo-name/mockServiceWorker.js` (GitHub Pages).
        serviceWorker: {
          url: 'mockServiceWorker.js',
        },
        onUnhandledRequest: 'bypass',
      })
      console.info('[MSW] Service Worker activo')
    } catch (err) {
      console.error('[MSW] Error al iniciar el Service Worker:', err)
    }
  }

  if (redirect) {
    void router.navigate(redirect, { replace: true })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
