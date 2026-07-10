export function getStoryMapEntity(storyMap, type, id) {
  if (!id) return null

  if (type === 'goal') {
    return storyMap.goals.find((goal) => goal.id === id) || null
  }

  if (type === 'release') {
    return storyMap.releases.find((release) => release.id === id) || null
  }

  for (const goal of storyMap.goals) {
    for (const step of goal.steps) {
      if (type === 'step' && step.id === id) {
        return { ...step, goalId: goal.id }
      }

      for (const story of step.stories) {
        if (type === 'story' && story.id === id) {
          return { ...story, stepId: step.id }
        }
      }
    }
  }

  return null
}

export function findStepInStoryMap(storyMap, id) {
  for (let goalIndex = 0; goalIndex < storyMap.goals.length; goalIndex += 1) {
    const stepIndex = storyMap.goals[goalIndex].steps.findIndex((step) => step.id === id)
    if (stepIndex !== -1) {
      return {
        goalIndex,
        stepIndex,
        goal: storyMap.goals[goalIndex],
        step: storyMap.goals[goalIndex].steps[stepIndex],
      }
    }
  }

  return null
}

export function findStoryInStoryMap(storyMap, id) {
  for (let goalIndex = 0; goalIndex < storyMap.goals.length; goalIndex += 1) {
    const goal = storyMap.goals[goalIndex]
    for (let stepIndex = 0; stepIndex < goal.steps.length; stepIndex += 1) {
      const storyIndex = goal.steps[stepIndex].stories.findIndex((story) => story.id === id)
      if (storyIndex !== -1) {
        return {
          goalIndex,
          stepIndex,
          storyIndex,
          story: goal.steps[stepIndex].stories[storyIndex],
        }
      }
    }
  }

  return null
}
