import { configureStore } from '@reduxjs/toolkit'

import authReducer from '@/features/auth/authSlice'
import uiReducer from '@/features/ui/uiSlice'
import { baseApi } from '@/shared/api/baseApi'

const reducer = {
  auth: authReducer,
  ui: uiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
}

/** Creates a fresh store instance — the app singleton and tests share this factory. */
export function setupStore() {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  })
}

export const store = setupStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
