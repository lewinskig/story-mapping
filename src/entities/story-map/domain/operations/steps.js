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
  if (target.position !== 'end' && movingId === target.stepId) return storyMap

  const located = findStepInStoryMap(storyMap, movingId)
  if (!located || !storyMap.goals.some((goal) => goal.id === target.goalId)) return storyMap

  const movingStep = located.step
  const cleanedGoals = storyMap.goals.map((goal, goalIndex) => ({
    ...goal,
    steps: goalIndex === located.goalIndex ? goal.steps.filter((step) => step.id !== movingId) : goal.steps,
  }))

  return {
    ...storyMap,
    goals: cleanedGoals.map((goal) => {
      if (goal.id !== target.goalId) return goal

      if (target.position === 'end') {
        return { ...goal, steps: [...goal.steps, movingStep] }
      }

      const targetIndex = goal.steps.findIndex((step) => step.id === target.stepId)
      if (targetIndex === -1) {
        return { ...goal, steps: [...goal.steps, movingStep] }
      }

      const insertIndex = target.position === 'after' ? targetIndex + 1 : targetIndex

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
