import { createStoryMapId } from '../services/idFactory'
import { findStoryInStoryMap } from '../services/entityLookup'

export function addStoryToStoryMap(storyMap, draft) {
  return {
    ...storyMap,
    goals: storyMap.goals.map((goal) => ({
      ...goal,
      steps: goal.steps.map((step) =>
        step.id === draft.stepId
          ? {
              ...step,
              stories: [
                ...step.stories,
                {
                  id: createStoryMapId('s', storyMap),
                  name: draft.name,
                  priority: draft.priority,
                  releaseId: draft.releaseId,
                },
              ],
            }
          : step,
      ),
    })),
  }
}

export function updateStoryInStoryMap(storyMap, id, draft) {
  const next = moveStoryInStoryMap(storyMap, id, {
    stepId: draft.stepId,
    releaseId: draft.releaseId,
    beforeStoryId: null,
  })

  return {
    ...next,
    goals: next.goals.map((goal) => ({
      ...goal,
      steps: goal.steps.map((step) => ({
        ...step,
        stories: step.stories.map((story) =>
          story.id === id ? { ...story, name: draft.name, priority: draft.priority, releaseId: draft.releaseId } : story,
        ),
      })),
    })),
  }
}

export function deleteStoryFromStoryMap(storyMap, id) {
  return {
    ...storyMap,
    goals: storyMap.goals.map((goal) => ({
      ...goal,
      steps: goal.steps.map((step) => ({
        ...step,
        stories: step.stories.filter((story) => story.id !== id),
      })),
    })),
  }
}

export function moveStoryInStoryMap(storyMap, movingId, target) {
  const located = findStoryInStoryMap(storyMap, movingId)
  if (!located) return storyMap

  const movingStory = { ...located.story, releaseId: target.releaseId }
  const goalsWithoutStory = storyMap.goals.map((goal, goalIndex) => ({
    ...goal,
    steps: goal.steps.map((step, stepIndex) => ({
      ...step,
      stories:
        goalIndex === located.goalIndex && stepIndex === located.stepIndex
          ? step.stories.filter((story) => story.id !== movingId)
          : step.stories,
    })),
  }))

  return {
    ...storyMap,
    goals: goalsWithoutStory.map((goal) => ({
      ...goal,
      steps: goal.steps.map((step) => {
        if (step.id !== target.stepId) return step

        if (!target.beforeStoryId) {
          return { ...step, stories: [...step.stories, movingStory] }
        }

        const insertIndex = step.stories.findIndex((story) => story.id === target.beforeStoryId)
        if (insertIndex === -1) {
          return { ...step, stories: [...step.stories, movingStory] }
        }

        return {
          ...step,
          stories: [...step.stories.slice(0, insertIndex), movingStory, ...step.stories.slice(insertIndex)],
        }
      }),
    })),
  }
}
