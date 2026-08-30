import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import FullScreenLoader from '@/app/FullScreenLoader'
import { useAppSelector } from '@/app/hooks'
import { selectAuthStatus } from '@/features/auth/authSlice'
import { useRefreshMutation } from '@/shared/api/apiSlice'

/**
 * Route guard for the authenticated area.
 *
 * - `authenticated` → renders the protected routes.
 * - `idle` (e.g. after a page reload) → attempts one silent session restore
 *   via the refresh cookie, showing a full-screen loader meanwhile.
 * - `unauthenticated` → redirects to /login preserving the target location.
 */
export default function RequireAuth() {
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()
  const [refresh] = useRefreshMutation()
  const refreshRequested = useRef(false)

  useEffect(() => {
    if (status === 'idle' && !refreshRequested.current) {
      refreshRequested.current = true
      void refresh()
    }
  }, [status, refresh])

  if (status === 'authenticated') {
    return <Outlet />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <FullScreenLoader label="Restaurando sesión…" />
}
