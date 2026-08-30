import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { clearCredentials, setCredentials } from '@/features/auth/authSlice'
import type { AuthState } from '@/features/auth/authSlice'
import type { User } from '@/shared/types'

export interface AuthResponse {
  accessToken: string
  user: User
}

/**
 * Absolute `/api` in tests (Node needs a parseable URL) and relative `api` in
 * the browser so it resolves correctly under a subpath like `/repo-name/api/*`.
 */
const API_BASE = process.env.NODE_ENV === 'test' ? '/api' : 'api'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

/** Bare query used for the refresh call itself (no Bearer header needed). */
const refreshQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: 'include',
})

type RefreshResult = Awaited<ReturnType<typeof refreshQuery>>

/**
 * Module-level mutex: concurrent 401s share a single in-flight refresh.
 * Cleared once the refresh settles so a later 401 can refresh again.
 */
let refreshPromise: Promise<RefreshResult> | null = null

function requestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) {
    return result
  }

  // A failing refresh call must not trigger another refresh.
  if (requestUrl(args) === '/auth/refresh') {
    api.dispatch(clearCredentials())
    return result
  }

  let pending = refreshPromise
  if (!pending) {
    pending = Promise.resolve(
      refreshQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions),
    ).finally(() => {
      refreshPromise = null
    })
    refreshPromise = pending
  }

  const refreshResult = await pending

  if (refreshResult.data) {
    api.dispatch(setCredentials(refreshResult.data as AuthResponse))
    result = await baseQuery(args, api, extraOptions)
  } else {
    api.dispatch(clearCredentials())
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Balance',
    'Transactions',
    'Transaction',
    'Cards',
    'Recipients',
    'User',
    'Vaults',
    'Goals',
    'Investments',
    'Notifications',
    'Insights',
  ],
  endpoints: () => ({}),
})
