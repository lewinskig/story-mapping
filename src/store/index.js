import { configureStore } from '@reduxjs/toolkit'
import { STORAGE_KEY } from '../model/board'
import boardReducer from './boardSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    board: boardReducer,
    ui: uiReducer,
  },
})

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().board))
  })
}
