import { createSelector } from '@reduxjs/toolkit'

export function getStoryMapColumns(goals) {
  return goals.flatMap((goal) => {
    if (!goal.steps.length) {
      return [{ type: 'step-add', id: `slot-${goal.id}`, goalId: goal.id }]
    }

    return [
      ...goal.steps.map((step) => ({ type: 'step', id: step.id, goalId: goal.id, goal, step })),
      { type: 'step-add', id: `slot-${goal.id}`, goalId: goal.id },
    ]
  })
}

export function getStoryMapSteps(goals) {
  return goals.flatMap((goal) => goal.steps.map((step) => ({ ...step, goalId: goal.id })))
}

export const selectStoryMap = (state) => state.storyMap.board
export const selectStoryMapGoals = (state) => state.storyMap.board.goals
export const selectStoryMapReleases = (state) => state.storyMap.board.releases
export const selectStoryMapColumns = createSelector([selectStoryMapGoals], getStoryMapColumns)
export const selectStoryMapSteps = createSelector([selectStoryMapGoals], getStoryMapSteps)
