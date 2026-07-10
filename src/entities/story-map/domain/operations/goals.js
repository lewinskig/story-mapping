import { createStoryMapId } from '../services/idFactory'

export function addGoalToStoryMap(storyMap, draft) {
  return {
    ...storyMap,
    goals: [...storyMap.goals, { id: createStoryMapId('g', storyMap), name: draft.name, color: draft.color, steps: [] }],
  }
}

export function updateGoalInStoryMap(storyMap, id, draft) {
  return {
    ...storyMap,
    goals: storyMap.goals.map((goal) => (goal.id === id ? { ...goal, name: draft.name, color: draft.color } : goal)),
  }
}

export function deleteGoalFromStoryMap(storyMap, id) {
  return {
    ...storyMap,
    goals: storyMap.goals.filter((goal) => goal.id !== id),
  }
}

export function moveGoalInStoryMap(storyMap, movingId, targetGoalId) {
  if (movingId === targetGoalId) return storyMap

  const fromIndex = storyMap.goals.findIndex((goal) => goal.id === movingId)
  const targetIndex = storyMap.goals.findIndex((goal) => goal.id === targetGoalId)
  if (fromIndex === -1 || targetIndex === -1) return storyMap

  const moving = storyMap.goals[fromIndex]
  const remaining = storyMap.goals.filter((goal) => goal.id !== movingId)
  const adjustedTarget = fromIndex < targetIndex ? targetIndex : targetIndex - 1

  return {
    ...storyMap,
    goals: [...remaining.slice(0, adjustedTarget + 1), moving, ...remaining.slice(adjustedTarget + 1)],
  }
}

export function moveGoalToEndInStoryMap(storyMap, movingId) {
  const moving = storyMap.goals.find((goal) => goal.id === movingId)
  if (!moving) return storyMap

  return {
    ...storyMap,
    goals: [...storyMap.goals.filter((goal) => goal.id !== movingId), moving],
  }
}
