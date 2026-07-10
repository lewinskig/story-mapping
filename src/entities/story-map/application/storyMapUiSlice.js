import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selection: null,
}

const storyMapUiSlice = createSlice({
  name: 'storyMapUi',
  initialState,
  reducers: {
    selectionSet: (state, action) => {
      state.selection = action.payload
    },
    selectionCleared: (state) => {
      state.selection = null
    },
    selectionDraftPatched: (state, action) => {
      if (!state.selection) return
      state.selection = {
        ...state.selection,
        draft: {
          ...state.selection.draft,
          ...action.payload,
        },
      }
    },
    selectionSynced: (state, action) => {
      if (!state.selection || state.selection.mode !== 'edit') return
      state.selection = {
        ...state.selection,
        draft: action.payload,
      }
    },
  },
})

export const {
  selectionSet,
  selectionCleared,
  selectionDraftPatched,
  selectionSynced,
} = storyMapUiSlice.actions

export default storyMapUiSlice.reducer

export const selectSelection = (state) => state.storyMapUi.selection
