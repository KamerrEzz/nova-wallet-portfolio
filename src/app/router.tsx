import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import FullScreenLoader from '@/app/FullScreenLoader'
import AppLayout from '@/app/layouts/AppLayout'
import RouteError from '@/app/RouteError'
import RequireAuth from '@/features/auth/RequireAuth'
import NotFoundPage from '@/pages/NotFoundPage'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'))
const TransfersPage = lazy(() => import('@/pages/TransfersPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<FullScreenLoader />}>{node}</Suspense>
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<LandingPage />),
    errorElement: <RouteError />,
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
    errorElement: <RouteError />,
  },
  {
    path: '/register',
    element: withSuspense(<RegisterPage />),
    errorElement: <RouteError />,
  },
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/app',
        element: <AppLayout />,
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            element: withSuspense(<DashboardPage />),
            errorElement: <RouteError />,
          },
          {
            path: 'transactions',
            element: withSuspense(<TransactionsPage />),
            errorElement: <RouteError />,
          },
          {
            path: 'transfers',
            element: withSuspense(<TransfersPage />),
            errorElement: <RouteError />,
          },
          {
            path: 'profile',
            element: withSuspense(<ProfilePage />),
            errorElement: <RouteError />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
], { basename })
