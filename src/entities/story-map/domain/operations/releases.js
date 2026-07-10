import { PLANNED_RELEASE_ID } from '../constants'
import { createStoryMapId } from '../services/idFactory'

export function addReleaseToStoryMap(storyMap, draft) {
  const planned = storyMap.releases.find((release) => release.id === PLANNED_RELEASE_ID)
  const rest = storyMap.releases.filter((release) => release.id !== PLANNED_RELEASE_ID)
  const next = { id: createStoryMapId('r', storyMap), name: draft.name, dueDate: draft.dueDate, system: false }

  return {
    ...storyMap,
    releases: planned ? [planned, next, ...rest] : [next, ...rest],
  }
}

export function updateReleaseInStoryMap(storyMap, id, draft) {
  return {
    ...storyMap,
    releases: storyMap.releases.map((release) =>
      release.id === id ? { ...release, name: draft.name, dueDate: draft.dueDate } : release,
    ),
  }
}

export function deleteReleaseFromStoryMap(storyMap, id) {
  if (id === PLANNED_RELEASE_ID) {
    return storyMap
  }

  return {
    releases: storyMap.releases.filter((release) => release.id !== id),
    goals: storyMap.goals.map((goal) => ({
      ...goal,
      steps: goal.steps.map((step) => ({
        ...step,
        stories: step.stories.map((story) =>
          story.releaseId === id ? { ...story, releaseId: PLANNED_RELEASE_ID } : story,
        ),
      })),
    })),
  }
}
