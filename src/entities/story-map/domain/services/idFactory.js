const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function collectStoryMapIds(storyMap) {
  return [
    ...storyMap.releases.map((release) => release.id),
    ...storyMap.goals.flatMap((goal) => [
      goal.id,
      ...goal.steps.flatMap((step) => [step.id, ...step.stories.map((story) => story.id)]),
    ]),
  ]
}

export function createStoryMapId(prefix, storyMap) {
  const ids = new Set(collectStoryMapIds(storyMap))

  while (true) {
    let suffix = ''
    for (let index = 0; index < 3; index += 1) {
      suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
    }

    const candidate = `${prefix}${suffix}`
    if (!ids.has(candidate)) {
      return candidate
    }
  }
}
