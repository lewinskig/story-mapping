import { createSelector, createSlice } from '@reduxjs/toolkit'
import {
  addGoal,
  addRelease,
  addStep,
  addStory,
  deleteEntity,
  getAllSteps,
  getColumns,
  getEntity,
  loadBoard,
  moveGoal,
  moveGoalToEnd,
  moveStep,
  moveStory,
  seedBoard,
  updateGoal,
  updateRelease,
  updateStep,
  updateStory,
} from '../model/board'

const boardSlice = createSlice({
  name: 'board',
  initialState: loadBoard(),
  reducers: {
    boardReset: () => seedBoard,
    goalAdded: (state, action) => addGoal(state, action.payload),
    goalUpdated: (state, action) => updateGoal(state, action.payload.id, action.payload.draft),
    stepAdded: (state, action) => addStep(state, action.payload),
    stepUpdated: (state, action) => updateStep(state, action.payload.id, action.payload.draft),
    storyAdded: (state, action) => addStory(state, action.payload),
    storyUpdated: (state, action) => updateStory(state, action.payload.id, action.payload.draft),
    releaseAdded: (state, action) => addRelease(state, action.payload),
    releaseUpdated: (state, action) => updateRelease(state, action.payload.id, action.payload.draft),
    entityDeleted: (state, action) => deleteEntity(state, action.payload.type, action.payload.id),
    goalMoved: (state, action) => moveGoal(state, action.payload.movingId, action.payload.targetGoalId),
    goalMovedToEnd: (state, action) => moveGoalToEnd(state, action.payload.movingId),
    stepMoved: (state, action) => moveStep(state, action.payload.movingId, action.payload.target),
    storyMoved: (state, action) => moveStory(state, action.payload.movingId, action.payload.target),
  },
})

export const {
  boardReset,
  goalAdded,
  goalUpdated,
  stepAdded,
  stepUpdated,
  storyAdded,
  storyUpdated,
  releaseAdded,
  releaseUpdated,
  entityDeleted,
  goalMoved,
  goalMovedToEnd,
  stepMoved,
  storyMoved,
} = boardSlice.actions

export default boardSlice.reducer

export const selectBoard = (state) => state.board
export const selectGoals = (state) => state.board.goals
export const selectReleases = (state) => state.board.releases
export const selectColumns = createSelector([selectGoals], getColumns)
export const selectSteps = createSelector([selectGoals], getAllSteps)
export const selectEntityByTypeAndId = (state, type, id) => getEntity(state.board, type, id)
