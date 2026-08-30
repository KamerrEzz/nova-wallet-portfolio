import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  kind: ToastKind
  message: string
}

export interface UiState {
  toasts: Toast[]
}

const initialState: UiState = {
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: {
      prepare(toast: Omit<Toast, 'id'>) {
        return { payload: { ...toast, id: nanoid() } }
      },
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload)
      },
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = uiSlice.actions

export default uiSlice.reducer

export const selectToasts = (state: RootState): Toast[] => state.ui.toasts
