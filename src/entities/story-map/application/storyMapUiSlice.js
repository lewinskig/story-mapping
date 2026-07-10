import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selection: null,
  dragState: null,
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
    dragStarted: (state, action) => {
      state.dragState = action.payload
    },
    dragEnded: (state) => {
      state.dragState = null
    },
  },
})

export const {
  selectionSet,
  selectionCleared,
  selectionDraftPatched,
  selectionSynced,
  dragStarted,
  dragEnded,
} = storyMapUiSlice.actions

export default storyMapUiSlice.reducer

export const selectSelection = (state) => state.storyMapUi.selection
export const selectDragState = (state) => state.storyMapUi.dragState
