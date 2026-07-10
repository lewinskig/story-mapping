export const STORAGE_KEY = 'story-mapping-board-v5'
export const CARD_WIDTH = 144
export const COLUMN_GAP = 12
export const PLANNED_RELEASE_ID = 'rpln'
export const goalPalette = ['sky', 'mint', 'peach', 'gold', 'lavender']

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'

export const seedBoard = {
  releases: [
    { id: PLANNED_RELEASE_ID, name: 'Planned', dueDate: '', system: true },
    { id: 'rmvp', name: 'MVP', dueDate: '2026-08-01', system: false },
    { id: 'r2nd', name: 'Release 2', dueDate: '', system: false },
  ],
  goals: [
    {
      id: 'gord',
      name: 'Order Food',
      color: 'sky',
      steps: [
        {
          id: 'ebrs',
          name: 'Browse restaurants',
          stories: [
            { id: 'svrl', name: 'View restaurant list', priority: 'high', releaseId: PLANNED_RELEASE_ID },
          ],
        },
        {
          id: 'esel',
          name: 'Select food items',
          stories: [
            { id: 'sbmc', name: 'Browse menu categories', priority: 'high', releaseId: PLANNED_RELEASE_ID },
            { id: 'scfi', name: 'Customize food item', priority: 'low', releaseId: 'r2nd' },
          ],
        },
        {
          id: 'eord',
          name: 'Place order',
          stories: [
            { id: 'sait', name: 'Add items to cart', priority: 'medium', releaseId: 'rmvp' },
          ],
        },
      ],
    },
    {
      id: 'gtrk',
      name: 'Track Order',
      color: 'mint',
      steps: [
        {
          id: 'evos',
          name: 'View order status',
          stories: [
            { id: 'strt', name: 'Track order in real time', priority: 'high', releaseId: 'rmvp' },
            { id: 'srdn', name: 'Receive delivery notifications', priority: 'medium', releaseId: 'r2nd' },
          ],
        },
        {
          id: 'evoh',
          name: 'View order history',
          stories: [],
        },
      ],
    },
    {
      id: 'gsup',
      name: 'Support Customer',
      color: 'peach',
      steps: [
        {
          id: 'econ',
          name: 'Contact support',
          stories: [
            { id: 'sacd', name: 'Access contact details', priority: 'medium', releaseId: 'rmvp' },
          ],
        },
        {
          id: 'efdb',
          name: 'Provide feedback',
          stories: [
            { id: 'ssfs', name: 'Submit feedback or suggestions', priority: 'low', releaseId: PLANNED_RELEASE_ID },
          ],
        },
      ],
    },
  ],
}

export function loadBoard() {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return seedBoard
  }

  try {
    const parsed = JSON.parse(saved)
    return isValidBoard(parsed) ? parsed : seedBoard
  } catch {
    return seedBoard
  }
}

function isValidBoard(value) {
  return Boolean(value && Array.isArray(value.goals) && Array.isArray(value.releases))
}

export function createId(prefix, board) {
  const ids = new Set(collectIds(board))

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

export function collectIds(board) {
  return [
    ...board.releases.map((release) => release.id),
    ...board.goals.flatMap((goal) => [
      goal.id,
      ...goal.steps.flatMap((step) => [step.id, ...step.stories.map((story) => story.id)]),
    ]),
  ]
}

export function getColumns(goals) {
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

export function getAllSteps(goals) {
  return goals.flatMap((goal) => goal.steps.map((step) => ({ ...step, goalId: goal.id })))
}

export function getEntity(board, type, id) {
  if (!id) return null

  if (type === 'goal') {
    return board.goals.find((goal) => goal.id === id) || null
  }

  if (type === 'release') {
    return board.releases.find((release) => release.id === id) || null
  }

  for (const goal of board.goals) {
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

export function addGoal(board, draft) {
  return {
    ...board,
    goals: [...board.goals, { id: createId('g', board), name: draft.name, color: draft.color, steps: [] }],
  }
}

export function addStep(board, draft) {
  return {
    ...board,
    goals: board.goals.map((goal) =>
      goal.id === draft.goalId
        ? {
            ...goal,
            steps: [...goal.steps, { id: createId('e', board), name: draft.name, stories: [] }],
          }
        : goal,
    ),
  }
}

export function addStory(board, draft) {
  return {
    ...board,
    goals: board.goals.map((goal) => ({
      ...goal,
      steps: goal.steps.map((step) =>
        step.id === draft.stepId
          ? {
              ...step,
              stories: [
                ...step.stories,
                {
                  id: createId('s', board),
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

export function addRelease(board, draft) {
  const planned = board.releases.find((release) => release.id === PLANNED_RELEASE_ID)
  const rest = board.releases.filter((release) => release.id !== PLANNED_RELEASE_ID)
  const next = { id: createId('r', board), name: draft.name, dueDate: draft.dueDate, system: false }

  return {
    ...board,
    releases: planned ? [planned, next, ...rest] : [next, ...rest],
  }
}

export function updateGoal(board, id, draft) {
  return {
    ...board,
    goals: board.goals.map((goal) => (goal.id === id ? { ...goal, name: draft.name, color: draft.color } : goal)),
  }
}

export function updateStep(board, id, draft) {
  const detached = removeStep(board, id, { preserveStories: true, preserveSelection: true })
  const movedStep = findStep(board, id)

  if (!movedStep) {
    return board
  }

  return {
    ...detached,
    goals: detached.goals.map((goal) =>
      goal.id === draft.goalId
        ? {
            ...goal,
            steps: [...goal.steps, { id, name: draft.name, stories: movedStep.step.stories }],
          }
        : goal,
    ),
  }
}

export function updateStory(board, id, draft) {
  const next = moveStory(board, id, {
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

export function updateRelease(board, id, draft) {
  return {
    ...board,
    releases: board.releases.map((release) =>
      release.id === id ? { ...release, name: draft.name, dueDate: draft.dueDate } : release,
    ),
  }
}

export function deleteEntity(board, type, id) {
  if (type === 'goal') {
    return { ...board, goals: board.goals.filter((goal) => goal.id !== id) }
  }

  if (type === 'step') {
    return removeStep(board, id)
  }

  if (type === 'story') {
    return {
      ...board,
      goals: board.goals.map((goal) => ({
        ...goal,
        steps: goal.steps.map((step) => ({
          ...step,
          stories: step.stories.filter((story) => story.id !== id),
        })),
      })),
    }
  }

  if (type === 'release') {
    if (id === PLANNED_RELEASE_ID) {
      return board
    }

    return {
      releases: board.releases.filter((release) => release.id !== id),
      goals: board.goals.map((goal) => ({
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

  return board
}

export function moveGoal(board, movingId, targetId) {
  if (movingId === targetId) return board

  const fromIndex = board.goals.findIndex((goal) => goal.id === movingId)
  const targetIndex = board.goals.findIndex((goal) => goal.id === targetId)
  if (fromIndex === -1 || targetIndex === -1) return board

  const moving = board.goals[fromIndex]
  const remaining = board.goals.filter((goal) => goal.id !== movingId)
  const adjustedTarget = fromIndex < targetIndex ? targetIndex : targetIndex - 1

  return {
    ...board,
    goals: [
      ...remaining.slice(0, adjustedTarget + 1),
      moving,
      ...remaining.slice(adjustedTarget + 1),
    ],
  }
}

export function moveGoalToEnd(board, movingId) {
  const moving = board.goals.find((goal) => goal.id === movingId)
  if (!moving) return board

  return {
    ...board,
    goals: [...board.goals.filter((goal) => goal.id !== movingId), moving],
  }
}

export function moveStep(board, movingId, target) {
  const located = findStep(board, movingId)
  if (!located) return board

  const cleanedGoals = board.goals.map((goal, goalIndex) => ({
    ...goal,
    steps: goalIndex === located.goalIndex ? goal.steps.filter((step) => step.id !== movingId) : goal.steps,
  }))

  return {
    ...board,
    goals: cleanedGoals.map((goal) => {
      if (goal.id !== target.goalId) {
        return goal
      }

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
        steps: [
          ...goal.steps.slice(0, insertIndex),
          movingStep,
          ...goal.steps.slice(insertIndex),
        ],
      }
    }),
  }
}

export function moveStory(board, movingId, target) {
  const located = findStory(board, movingId)
  if (!located) return board

  const movingStory = { ...located.story, releaseId: target.releaseId }
  const goalsWithoutStory = board.goals.map((goal, goalIndex) => ({
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
    ...board,
    goals: goalsWithoutStory.map((goal) => ({
      ...goal,
      steps: goal.steps.map((step) => {
        if (step.id !== target.stepId) {
          return step
        }

        if (!target.beforeStoryId) {
          return { ...step, stories: [...step.stories, movingStory] }
        }

        const insertIndex = step.stories.findIndex((story) => story.id === target.beforeStoryId)
        if (insertIndex === -1) {
          return { ...step, stories: [...step.stories, movingStory] }
        }

        return {
          ...step,
          stories: [
            ...step.stories.slice(0, insertIndex),
            movingStory,
            ...step.stories.slice(insertIndex),
          ],
        }
      }),
    })),
  }
}

function removeStep(board, id, options = {}) {
  return {
    ...board,
    goals: board.goals.map((goal) => ({
      ...goal,
      steps: goal.steps.filter((step) => step.id !== id),
    })),
  }
}

function findStep(board, id) {
  for (let goalIndex = 0; goalIndex < board.goals.length; goalIndex += 1) {
    const stepIndex = board.goals[goalIndex].steps.findIndex((step) => step.id === id)
    if (stepIndex !== -1) {
      return {
        goalIndex,
        stepIndex,
        goal: board.goals[goalIndex],
        step: board.goals[goalIndex].steps[stepIndex],
      }
    }
  }

  return null
}

function findStory(board, id) {
  for (let goalIndex = 0; goalIndex < board.goals.length; goalIndex += 1) {
    const goal = board.goals[goalIndex]
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
