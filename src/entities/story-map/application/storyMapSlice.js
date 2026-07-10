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
import { loadStoryMapState } from '../infrastructure/persistence/boardStorage'

const initialState = {
  board: loadStoryMapState(),
}

const storyMapSlice = createSlice({
  name: 'storyMap',
  initialState,
  reducers: {
    storyMapReset: () => ({ board: defaultStoryMap }),
    goalAdded: (state, action) => {
      state.board = addGoalToStoryMap(state.board, action.payload)
    },
    goalUpdated: (state, action) => {
      state.board = updateGoalInStoryMap(state.board, action.payload.id, action.payload.draft)
    },
    stepAdded: (state, action) => {
      state.board = addStepToStoryMap(state.board, action.payload)
    },
    stepUpdated: (state, action) => {
      state.board = updateStepInStoryMap(state.board, action.payload.id, action.payload.draft)
    },
    storyAdded: (state, action) => {
      state.board = addStoryToStoryMap(state.board, action.payload)
    },
    storyUpdated: (state, action) => {
      state.board = updateStoryInStoryMap(state.board, action.payload.id, action.payload.draft)
    },
    releaseAdded: (state, action) => {
      state.board = addReleaseToStoryMap(state.board, action.payload)
    },
    releaseUpdated: (state, action) => {
      state.board = updateReleaseInStoryMap(state.board, action.payload.id, action.payload.draft)
    },
    goalDeleted: (state, action) => {
      state.board = deleteGoalFromStoryMap(state.board, action.payload.id)
    },
    stepDeleted: (state, action) => {
      state.board = deleteStepFromStoryMap(state.board, action.payload.id)
    },
    storyDeleted: (state, action) => {
      state.board = deleteStoryFromStoryMap(state.board, action.payload.id)
    },
    releaseDeleted: (state, action) => {
      state.board = deleteReleaseFromStoryMap(state.board, action.payload.id)
    },
    goalMoved: (state, action) => {
      state.board = moveGoalInStoryMap(state.board, action.payload.movingId, action.payload.targetGoalId)
    },
    goalMovedToEnd: (state, action) => {
      state.board = moveGoalToEndInStoryMap(state.board, action.payload.movingId)
    },
    stepMoved: (state, action) => {
      state.board = moveStepInStoryMap(state.board, action.payload.movingId, action.payload.target)
    },
    storyMoved: (state, action) => {
      state.board = moveStoryInStoryMap(state.board, action.payload.movingId, action.payload.target)
    },
  },
})

export const {
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
