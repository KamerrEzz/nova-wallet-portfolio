import { clearCredentials, setCredentials, setUser } from '@/features/auth/authSlice'
import { addToast } from '@/features/ui/uiSlice'
import type { Balance, CardModel, Transaction, User } from '@/shared/types'

import { baseApi } from './baseApi'
import type { AuthResponse } from './baseApi'

/* ------------------------------------------------------------------ */
/* Endpoint request/response types                                     */
/* ------------------------------------------------------------------ */

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TransactionsQuery {
  search?: string
  type?: 'income' | 'expense' | 'all'
  category?: string
  /** ISO date (inclusive lower bound). */
  from?: string
  /** ISO date (inclusive upper bound). */
  to?: string
  page: number
  pageSize: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface UpdateProfileRequest {
  name?: string
  avatarUrl?: string
}

export interface TransferRequest {
  recipientId: string
  amount: number
  concept?: string
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Extracts the server-provided `{ message }` from a rejected
 * `queryFulfilled` (shape `{ error: FetchBaseQueryError }`) or a raw
 * FetchBaseQueryError.
 */
function getErrorMessage(error: unknown, fallback: string): string {
  const fetchError =
    typeof error === 'object' && error !== null && 'error' in error
      ? (error as { error: unknown }).error
      : error

  if (typeof fetchError === 'object' && fetchError !== null && 'data' in fetchError) {
    const data = (fetchError as { data?: { message?: unknown } }).data
    if (data && typeof data.message === 'string') {
      return data.message
    }
  }
  return fallback
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

export const api = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /* ------------------------------ auth ---------------------------- */

    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch {
          // El formulario muestra el error desde el estado de la mutación.
        }
      },
    }),

    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch {
          // El formulario muestra el error desde el estado de la mutación.
        }
      },
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          // La sesión local se limpia igualmente.
        }
        dispatch(clearCredentials())
        dispatch(api.util.resetApiState())
      },
    }),

    refresh: build.mutation<AuthResponse, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch {
          dispatch(clearCredentials())
        }
      },
    }),

    /* ------------------------------ user ---------------------------- */

    getMe: build.query<User, void>({
      query: () => '/me',
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    updateProfile: build.mutation<User, UpdateProfileRequest>({
      query: (body) => ({ url: '/profile', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          // El consumidor muestra el error desde el estado de la mutación.
        }
      },
    }),

    /* ----------------------------- wallet --------------------------- */

    getBalance: build.query<Balance, void>({
      query: () => '/balance',
      providesTags: ['Balance'],
    }),

    getCards: build.query<CardModel[], void>({
      query: () => '/cards',
      providesTags: ['Cards'],
    }),

    getRecipients: build.query<User[], void>({
      query: () => '/recipients',
      providesTags: ['Recipients'],
    }),

    getTransactions: build.query<PaginatedResult<Transaction>, TransactionsQuery>({
      query: ({ search, type, category, from, to, page, pageSize }) => ({
        url: '/transactions',
        params: {
          ...(search ? { search } : {}),
          ...(type && type !== 'all' ? { type } : {}),
          ...(category ? { category } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          page,
          pageSize,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((tx) => ({ type: 'Transaction' as const, id: tx.id })),
              { type: 'Transactions' as const, id: 'LIST' },
            ]
          : [{ type: 'Transactions' as const, id: 'LIST' }],
    }),

    getTransactionById: build.query<Transaction, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Transaction', id }],
    }),

    createTransfer: build.mutation<Transaction, TransferRequest>({
      query: (body) => ({ url: '/transfers', method: 'POST', body }),
      invalidatesTags: ['Balance', 'Transactions'],
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        // Optimistic balance update — rollback on error.
        const patchResult = dispatch(
          api.util.updateQueryData('getBalance', undefined, (draft) => {
            draft.total -= body.amount
          }),
        )
        try {
          await queryFulfilled
          dispatch(addToast({ kind: 'success', message: 'Transferencia enviada' }))
        } catch (error) {
          patchResult.undo()
          dispatch(
            addToast({
              kind: 'error',
              message: getErrorMessage(error, 'No se pudo enviar la transferencia'),
            }),
          )
        }
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetBalanceQuery,
  useGetCardsQuery,
  useGetRecipientsQuery,
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransferMutation,
} = api
