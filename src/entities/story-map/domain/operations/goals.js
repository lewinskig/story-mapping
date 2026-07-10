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

export function moveGoalInStoryMap(storyMap, movingId, target) {
  if (target.position !== 'end' && movingId === target.goalId) return storyMap

  const moving = storyMap.goals.find((goal) => goal.id === movingId)
  if (!moving) return storyMap

  const remaining = storyMap.goals.filter((goal) => goal.id !== movingId)
  const targetIndex = target.position === 'end' ? remaining.length : remaining.findIndex((goal) => goal.id === target.goalId)
  if (targetIndex === -1) return storyMap

  const insertIndex = target.position === 'after' ? targetIndex + 1 : targetIndex

  return {
    ...storyMap,
    goals: [...remaining.slice(0, insertIndex), moving, ...remaining.slice(insertIndex)],
  }
}

export function moveGoalToEndInStoryMap(storyMap, movingId) {
  return moveGoalInStoryMap(storyMap, movingId, { position: 'end' })
}
