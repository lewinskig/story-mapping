import { createSlice } from '@reduxjs/toolkit'
import { defaultStoryMap } from '../domain/seed/defaultStoryMap'
import {
  addGoalToStoryMap,
  addReleaseToStoryMap,
  addStepToStoryMap,
  addStoryToStoryMap,
  deleteGoalFromStoryMap,
  deleteReleaseFromStoryMap,
  deleteStepFromStoryMap,
  deleteStoryFromStoryMap,
  moveGoalInStoryMap,
  moveGoalToEndInStoryMap,
  moveStepInStoryMap,
  moveStoryInStoryMap,
  updateGoalInStoryMap,
  updateReleaseInStoryMap,
  updateStepInStoryMap,
  updateStoryInStoryMap,
} from '../domain/operations/storyMapOperations'

const initialState = {
  board: defaultStoryMap,
  boardId: 'default',
  loadStatus: 'idle',
  saveStatus: 'idle',
  error: null,
  isDirty: false,
}

function markChanged(state) {
  state.isDirty = true
  state.saveStatus = 'idle'
}

const storyMapSlice = createSlice({
  name: 'storyMap',
  initialState,
  reducers: {
    boardLoadStarted: (state) => {
      state.loadStatus = 'loading'
      state.error = null
    },
    boardLoaded: (state, action) => {
      state.board = action.payload.board
      state.boardId = action.payload.id
      state.loadStatus = 'ready'
      state.saveStatus = 'idle'
      state.error = null
      state.isDirty = false
    },
    boardLoadFailed: (state, action) => {
      state.loadStatus = 'failed'
      state.error = action.payload
    },
    boardSaveStarted: (state) => {
      state.saveStatus = 'saving'
      state.error = null
    },
    boardSaveSucceeded: (state, action) => {
      state.boardId = action.payload?.id || state.boardId
      state.saveStatus = 'saved'
      state.error = null
      state.isDirty = false
    },
    boardSaveFailed: (state, action) => {
      state.saveStatus = 'failed'
      state.error = action.payload
    },
    storyMapReset: (state) => {
      state.board = defaultStoryMap
      markChanged(state)
    },
    goalAdded: (state, action) => {
      state.board = addGoalToStoryMap(state.board, action.payload)
      markChanged(state)
    },
    goalUpdated: (state, action) => {
      state.board = updateGoalInStoryMap(state.board, action.payload.id, action.payload.draft)
      markChanged(state)
    },
    stepAdded: (state, action) => {
      state.board = addStepToStoryMap(state.board, action.payload)
      markChanged(state)
    },
    stepUpdated: (state, action) => {
      state.board = updateStepInStoryMap(state.board, action.payload.id, action.payload.draft)
      markChanged(state)
    },
    storyAdded: (state, action) => {
      state.board = addStoryToStoryMap(state.board, action.payload)
      markChanged(state)
    },
    storyUpdated: (state, action) => {
      state.board = updateStoryInStoryMap(state.board, action.payload.id, action.payload.draft)
      markChanged(state)
    },
    releaseAdded: (state, action) => {
      state.board = addReleaseToStoryMap(state.board, action.payload)
      markChanged(state)
    },
    releaseUpdated: (state, action) => {
      state.board = updateReleaseInStoryMap(state.board, action.payload.id, action.payload.draft)
      markChanged(state)
    },
    goalDeleted: (state, action) => {
      state.board = deleteGoalFromStoryMap(state.board, action.payload.id)
      markChanged(state)
    },
    stepDeleted: (state, action) => {
      state.board = deleteStepFromStoryMap(state.board, action.payload.id)
      markChanged(state)
    },
    storyDeleted: (state, action) => {
      state.board = deleteStoryFromStoryMap(state.board, action.payload.id)
      markChanged(state)
    },
    releaseDeleted: (state, action) => {
      state.board = deleteReleaseFromStoryMap(state.board, action.payload.id)
      markChanged(state)
    },
    goalMoved: (state, action) => {
      state.board = moveGoalInStoryMap(state.board, action.payload.movingId, action.payload.target)
      markChanged(state)
    },
    goalMovedToEnd: (state, action) => {
      state.board = moveGoalToEndInStoryMap(state.board, action.payload.movingId)
      markChanged(state)
    },
    stepMoved: (state, action) => {
      state.board = moveStepInStoryMap(state.board, action.payload.movingId, action.payload.target)
      markChanged(state)
    },
    storyMoved: (state, action) => {
      state.board = moveStoryInStoryMap(state.board, action.payload.movingId, action.payload.target)
      markChanged(state)
    },
  },
})

export const {
  boardLoadStarted,
  boardLoaded,
  boardLoadFailed,
  boardSaveStarted,
  boardSaveSucceeded,
  boardSaveFailed,
  storyMapReset,
  goalAdded,
  goalUpdated,
  stepAdded,
  stepUpdated,
  storyAdded,
  storyUpdated,
  releaseAdded,
  releaseUpdated,
  goalDeleted,
  stepDeleted,
  storyDeleted,
  releaseDeleted,
  goalMoved,
  goalMovedToEnd,
  stepMoved,
  storyMoved,
} = storyMapSlice.actions

export default storyMapSlice.reducer
