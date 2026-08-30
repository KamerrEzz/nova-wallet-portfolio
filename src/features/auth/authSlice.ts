import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import type { User } from '@/shared/types'

export interface AuthState {
  user: User | null
  accessToken: string | null
  status: 'idle' | 'authenticated' | 'unauthenticated'
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.status = 'authenticated'
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
      state.status = 'unauthenticated'
    },
  },
})

export const { setCredentials, setUser, clearCredentials } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state: RootState): User | null => state.auth.user
export const selectAccessToken = (state: RootState): string | null => state.auth.accessToken
export const selectAuthStatus = (state: RootState): AuthState['status'] => state.auth.status
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.status === 'authenticated'
