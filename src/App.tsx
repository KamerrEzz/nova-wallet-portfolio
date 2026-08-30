import { RouterProvider } from 'react-router-dom'

import AppProviders from '@/app/providers'
import ErrorBoundary from '@/app/ErrorBoundary'
import { router } from '@/app/router'

export default function App() {
  return (
    <AppProviders>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AppProviders>
  )
}
