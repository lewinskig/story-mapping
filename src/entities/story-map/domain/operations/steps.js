import { createStoryMapId } from '../services/idFactory'
import { findStepInStoryMap } from '../services/entityLookup'

export function addStepToStoryMap(storyMap, draft) {
  return {
    ...storyMap,
    goals: storyMap.goals.map((goal) =>
      goal.id === draft.goalId
        ? { ...goal, steps: [...goal.steps, { id: createStoryMapId('e', storyMap), name: draft.name, stories: [] }] }
        : goal,
    ),
  }
}

export function updateStepInStoryMap(storyMap, id, draft) {
  const detached = removeStepFromStoryMap(storyMap, id)
  const movedStep = findStepInStoryMap(storyMap, id)

  if (!movedStep) {
    return storyMap
  }

  return {
    ...detached,
    goals: detached.goals.map((goal) =>
      goal.id === draft.goalId
        ? { ...goal, steps: [...goal.steps, { id, name: draft.name, stories: movedStep.step.stories }] }
        : goal,
    ),
  }
}

export function deleteStepFromStoryMap(storyMap, id) {
  return removeStepFromStoryMap(storyMap, id)
}

export function moveStepInStoryMap(storyMap, movingId, target) {
  const located = findStepInStoryMap(storyMap, movingId)
  if (!located) return storyMap

  const cleanedGoals = storyMap.goals.map((goal, goalIndex) => ({
    ...goal,
    steps: goalIndex === located.goalIndex ? goal.steps.filter((step) => step.id !== movingId) : goal.steps,
  }))

  return {
    ...storyMap,
    goals: cleanedGoals.map((goal) => {
      if (goal.id !== target.goalId) return goal

      const movingStep = located.step
      if (!target.beforeStepId) {
        return { ...goal, steps: [...goal.steps, movingStep] }
      }

      const insertIndex = goal.steps.findIndex((step) => step.id === target.beforeStepId)
      if (insertIndex === -1) {
        return { ...goal, steps: [...goal.steps, movingStep] }
      }

      return {
        ...goal,
        steps: [...goal.steps.slice(0, insertIndex), movingStep, ...goal.steps.slice(insertIndex)],
      }
    }),
  }
}

function removeStepFromStoryMap(storyMap, id) {
  return {
    ...storyMap,
    goals: storyMap.goals.map((goal) => ({
      ...goal,
      steps: goal.steps.filter((step) => step.id !== id),
    })),
  }
}
