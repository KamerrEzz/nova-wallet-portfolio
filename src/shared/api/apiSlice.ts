import { clearCredentials, setCredentials, setUser } from '@/features/auth/authSlice'
import { addToast } from '@/features/ui/uiSlice'
import type {
  Balance,
  CardModel,
  Goal,
  Investment,
  NotificationItem,
  SpendingInsight,
  Transaction,
  User,
  Vault,
} from '@/shared/types'

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

    /* ----------------------------- cards ---------------------------- */

    createVirtualCard: build.mutation<CardModel, Partial<CardModel>>({
      query: (body) => ({ url: '/cards', method: 'POST', body }),
      invalidatesTags: ['Cards'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(addToast({ kind: 'success', message: 'Tarjeta virtual creada' }))
        } catch (error) {
          dispatch(addToast({ kind: 'error', message: getErrorMessage(error, 'No se pudo crear la tarjeta') }))
        }
      },
    }),

    updateCard: build.mutation<CardModel, { id: string; body: Partial<CardModel> }>({
      query: ({ id, body }) => ({ url: `/cards/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Cards'],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          api.util.updateQueryData('getCards', undefined, (draft) => {
            const card = draft.find((c) => c.id === id)
            if (card) Object.assign(card, body)
          }),
        )
        try {
          await queryFulfilled
        } catch (error) {
          patchResult.undo()
          dispatch(addToast({ kind: 'error', message: getErrorMessage(error, 'No se pudo actualizar la tarjeta') }))
        }
      },
    }),

    createDisposableCard: build.mutation<CardModel, string>({
      query: (id) => ({ url: `/cards/${id}/disposable`, method: 'POST' }),
      invalidatesTags: ['Cards'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(addToast({ kind: 'success', message: 'Tarjeta desechable creada' }))
        } catch (error) {
          dispatch(addToast({ kind: 'error', message: getErrorMessage(error, 'No se pudo crear la tarjeta desechable') }))
        }
      },
    }),

    /* ----------------------------- vaults --------------------------- */

    getVaults: build.query<Vault[], void>({
      query: () => '/vaults',
      providesTags: ['Vaults'],
    }),

    createVault: build.mutation<Vault, Partial<Vault>>({
      query: (body) => ({ url: '/vaults', method: 'POST', body }),
      invalidatesTags: ['Vaults'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(addToast({ kind: 'success', message: 'Bóveda creada' }))
        } catch (error) {
          dispatch(addToast({ kind: 'error', message: getErrorMessage(error, 'No se pudo crear la bóveda') }))
        }
      },
    }),

    updateVault: build.mutation<Vault, { id: string; body: Partial<Vault> }>({
      query: ({ id, body }) => ({ url: `/vaults/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Vaults'],
    }),

    transferToVault: build.mutation<Vault, { id: string; amount: number }>({
      query: ({ id, amount }) => ({ url: `/vaults/${id}/transfer`, method: 'POST', body: { amount } }),
      invalidatesTags: ['Vaults', 'Balance', 'Transactions'],
      async onQueryStarted({ amount }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getBalance', undefined, (draft) => {
            draft.total -= amount
          }),
        )
        try {
          await queryFulfilled
          dispatch(addToast({ kind: 'success', message: 'Ahorro registrado' }))
        } catch (error) {
          patchResult.undo()
          dispatch(addToast({ kind: 'error', message: getErrorMessage(error, 'No se pudo mover el dinero') }))
        }
      },
    }),

    getGoals: build.query<Goal[], void>({
      query: () => '/goals',
      providesTags: ['Goals'],
    }),

    createGoal: build.mutation<Goal, Partial<Goal>>({
      query: (body) => ({ url: '/goals', method: 'POST', body }),
      invalidatesTags: ['Goals'],
    }),

    /* -------------------------- investments ------------------------- */

    getInvestments: build.query<Investment[], void>({
      query: () => '/investments',
      providesTags: ['Investments'],
    }),

    getInvestmentPerformance: build.query<{ date: string; value: number }[], void>({
      query: () => '/investments/performance',
      providesTags: ['Investments'],
    }),

    getSpendingInsight: build.query<SpendingInsight, void>({
      query: () => '/insights/spending',
      providesTags: ['Insights'],
    }),

    /* -------------------------- notifications ----------------------- */

    getNotifications: build.query<NotificationItem[], void>({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),

    markNotificationRead: build.mutation<NotificationItem, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getNotifications', undefined, (draft) => {
            const n = draft.find((item) => item.id === id)
            if (n) n.read = true
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getNotifications', undefined, (draft) => {
            for (const n of draft) n.read = true
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    /* ----------------------------- export ---------------------------- */

    exportTransactions: build.mutation<Blob, void>({
      query: () => ({ url: '/export/transactions.csv', method: 'GET', responseHandler: (response) => response.blob() }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const url = URL.createObjectURL(data)
          const a = document.createElement('a')
          a.href = url
          a.download = 'nova-transactions.csv'
          a.click()
          URL.revokeObjectURL(url)
        } catch {
          // El consumidor muestra el error desde el estado de la mutación.
        }
      },
    }),

    contactSupport: build.mutation<{ ticketId: string }, { subject: string; message: string }>({
      query: (body) => ({ url: '/support/contact', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(addToast({ kind: 'success', message: 'Mensaje enviado. Te responderemos pronto.' }))
        } catch (error) {
          dispatch(addToast({ kind: 'error', message: getErrorMessage(error, 'No se pudo enviar el mensaje') }))
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
  useCreateVirtualCardMutation,
  useUpdateCardMutation,
  useCreateDisposableCardMutation,
  useGetVaultsQuery,
  useCreateVaultMutation,
  useUpdateVaultMutation,
  useTransferToVaultMutation,
  useGetGoalsQuery,
  useCreateGoalMutation,
  useGetInvestmentsQuery,
  useGetInvestmentPerformanceQuery,
  useGetSpendingInsightQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useExportTransactionsMutation,
  useContactSupportMutation,
} = api
