import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'story-mapping-board-v2'
const CARD_WIDTH = 220
const COLUMN_GAP = 12
const goalPalette = ['sky', 'mint', 'peach', 'gold', 'lavender']

const seedData = {
  goals: [
    { id: 'g1', title: 'Order Food', color: 'sky' },
    { id: 'g2', title: 'Track Order', color: 'mint' },
    { id: 'g3', title: 'Support Customer', color: 'peach' },
  ],
  steps: [
    { id: 's1', goalId: 'g1', title: 'Browse restaurants' },
    { id: 's2', goalId: 'g1', title: 'Select food items' },
    { id: 's3', goalId: 'g1', title: 'Place order' },
    { id: 's4', goalId: 'g2', title: 'View order status' },
    { id: 's5', goalId: 'g2', title: 'View order history' },
    { id: 's6', goalId: 'g3', title: 'Contact support' },
    { id: 's7', goalId: 'g3', title: 'Provide feedback' },
  ],
  releases: [
    { id: 'r1', title: 'MVP' },
    { id: 'r2', title: 'Release 2' },
  ],
  stories: [
    {
      id: 'st1',
      releaseId: 'r1',
      stepId: 's1',
      title: 'View restaurant list',
      priority: 'high',
      side: 'below',
    },
    {
      id: 'st2',
      releaseId: 'r1',
      stepId: 's2',
      title: 'Browse menu categories',
      priority: 'high',
      side: 'below',
    },
    {
      id: 'st3',
      releaseId: 'r1',
      stepId: 's3',
      title: 'Add items to cart',
      priority: 'medium',
      side: 'below',
    },
    {
      id: 'st4',
      releaseId: 'r1',
      stepId: 's4',
      title: 'Track order in real time',
      priority: 'high',
      side: 'above',
    },
    {
      id: 'st5',
      releaseId: 'r1',
      stepId: 's6',
      title: 'Access contact details',
      priority: 'medium',
      side: 'below',
    },
    {
      id: 'st6',
      releaseId: 'r2',
      stepId: 's2',
      title: 'Customize food item',
      priority: 'low',
      side: 'below',
    },
    {
      id: 'st7',
      releaseId: 'r2',
      stepId: 's4',
      title: 'Receive delivery notifications',
      priority: 'medium',
      side: 'below',
    },
    {
      id: 'st8',
      releaseId: 'r2',
      stepId: 's7',
      title: 'Submit feedback or suggestions',
      priority: 'low',
      side: 'above',
    },
  ],
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function loadBoard() {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return seedData
  }

  try {
    return JSON.parse(saved)
  } catch {
    return seedData
  }
}

function buildColumns(goals, steps) {
  return goals.flatMap((goal) => {
    const goalSteps = steps.filter((step) => step.goalId === goal.id)

    if (goalSteps.length === 0) {
      return [{ type: 'step-add', goalId: goal.id, id: `slot-${goal.id}` }]
    }

    return [
      ...goalSteps.map((step) => ({ type: 'step', goalId: goal.id, id: step.id, step })),
      { type: 'step-add', goalId: goal.id, id: `slot-${goal.id}` },
    ]
  })
}

function createSelection(mode, type, draft, meta = {}) {
  return { mode, type, draft, ...meta }
}

function buttonLabel(mode) {
  return mode === 'create' ? 'Add' : 'Update'
}

function App() {
  const [board, setBoard] = useState(loadBoard)
  const [selection, setSelection] = useState(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  }, [board])

  const columns = useMemo(() => buildColumns(board.goals, board.steps), [board.goals, board.steps])
  const realSteps = useMemo(() => board.goals.flatMap((goal) => board.steps.filter((step) => step.goalId === goal.id)), [board.goals, board.steps])

  const headerGridColumns = `repeat(${Math.max(columns.length + 1, 1)}, ${CARD_WIDTH}px)`
  const releaseGridColumns = `repeat(${Math.max(columns.length, 1)}, ${CARD_WIDTH}px)`
  const boardWidth = Math.max(columns.length * (CARD_WIDTH + COLUMN_GAP) - COLUMN_GAP, CARD_WIDTH)

  function resetBoard() {
    setBoard(seedData)
    setSelection(null)
  }

  function openGoalCreate() {
    setSelection(
      createSelection('create', 'goal', {
        title: '',
        color: goalPalette[board.goals.length % goalPalette.length],
      }),
    )
  }

  function openGoalEdit(goal) {
    setSelection(createSelection('edit', 'goal', { ...goal }, { id: goal.id }))
  }

  function openStepCreate(goalId) {
    setSelection(createSelection('create', 'step', { title: '', goalId }))
  }

  function openStepEdit(step) {
    setSelection(createSelection('edit', 'step', { ...step }, { id: step.id }))
  }

  function openReleaseCreate() {
    setSelection(createSelection('create', 'release', { title: '' }))
  }

  function openReleaseEdit(release) {
    setSelection(createSelection('edit', 'release', { ...release }, { id: release.id }))
  }

  function openStoryCreate(releaseId, stepId, side) {
    setSelection(
      createSelection('create', 'story', {
        title: '',
        releaseId,
        stepId,
        side,
        priority: 'medium',
      }),
    )
  }

  function openStoryEdit(story) {
    setSelection(createSelection('edit', 'story', { ...story }, { id: story.id }))
  }

  function updateDraft(patch) {
    setSelection((current) => (current ? { ...current, draft: { ...current.draft, ...patch } } : current))
  }

  function submitSelection(event) {
    event.preventDefault()
    if (!selection) return

    const draft = normalizeDraft(selection.type, selection.draft)
    if (!draft) return

    if (selection.mode === 'create') {
      if (selection.type === 'goal') {
        setBoard((current) => ({
          ...current,
          goals: [...current.goals, { id: uid('goal'), ...draft }],
        }))
      }

      if (selection.type === 'step') {
        setBoard((current) => ({
          ...current,
          steps: [...current.steps, { id: uid('step'), ...draft }],
        }))
      }

      if (selection.type === 'release') {
        setBoard((current) => ({
          ...current,
          releases: [...current.releases, { id: uid('release'), ...draft }],
        }))
      }

      if (selection.type === 'story') {
        setBoard((current) => ({
          ...current,
          stories: [...current.stories, { id: uid('story'), ...draft }],
        }))
      }

      setSelection(null)
      return
    }

    if (selection.type === 'goal') {
      setBoard((current) => ({
        ...current,
        goals: current.goals.map((goal) => (goal.id === selection.id ? { ...goal, ...draft } : goal)),
      }))
    }

    if (selection.type === 'step') {
      setBoard((current) => ({
        ...current,
        steps: current.steps.map((step) => (step.id === selection.id ? { ...step, ...draft } : step)),
      }))
    }

    if (selection.type === 'release') {
      setBoard((current) => ({
        ...current,
        releases: current.releases.map((release) =>
          release.id === selection.id ? { ...release, ...draft } : release,
        ),
      }))
    }

    if (selection.type === 'story') {
      setBoard((current) => ({
        ...current,
        stories: current.stories.map((story) => (story.id === selection.id ? { ...story, ...draft } : story)),
      }))
    }

    setSelection(null)
  }

  function deleteSelection() {
    if (!selection || selection.mode !== 'edit') return

    if (selection.type === 'goal') {
      setBoard((current) => {
        const stepIds = current.steps.filter((step) => step.goalId === selection.id).map((step) => step.id)

        return {
          goals: current.goals.filter((goal) => goal.id !== selection.id),
          steps: current.steps.filter((step) => step.goalId !== selection.id),
          releases: current.releases,
          stories: current.stories.filter((story) => !stepIds.includes(story.stepId)),
        }
      })
    }

    if (selection.type === 'step') {
      setBoard((current) => ({
        ...current,
        steps: current.steps.filter((step) => step.id !== selection.id),
        stories: current.stories.filter((story) => story.stepId !== selection.id),
      }))
    }

    if (selection.type === 'release') {
      setBoard((current) => ({
        ...current,
        releases: current.releases.filter((release) => release.id !== selection.id),
        stories: current.stories.filter((story) => story.releaseId !== selection.id),
      }))
    }

    if (selection.type === 'story') {
      setBoard((current) => ({
        ...current,
        stories: current.stories.filter((story) => story.id !== selection.id),
      }))
    }

    setSelection(null)
  }

  return (
    <div className={`app-shell ${selection ? 'has-sidebar' : ''}`}>
      <main className="workspace">
        <div className="board-shell">
          <header className="board-header">
            <div>
              <p className="eyebrow">Story mapping</p>
              <h1>Plan goals, steps and stories on one board.</h1>
            </div>
            <button type="button" className="ghost-button" onClick={resetBoard}>
              Reset sample board
            </button>
          </header>

          <div className="board-scroll">
            <div className="board-surface" style={{ minWidth: `${boardWidth + CARD_WIDTH + COLUMN_GAP}px` }}>
              <section className="lane-section">
                <div className="lane-caption">User goals</div>
                <div className="lane-grid" style={{ gridTemplateColumns: headerGridColumns }}>
                  {board.goals.map((goal) => {
                    const span = Math.max(board.steps.filter((step) => step.goalId === goal.id).length, 0) + 1

                    return (
                      <button
                        key={goal.id}
                        type="button"
                        className={`card goal-card ${selection?.id === goal.id ? 'is-active' : ''}`}
                        data-color={goal.color}
                        style={{ gridColumn: `span ${span}` }}
                        onClick={() => openGoalEdit(goal)}
                      >
                        <span>{goal.title}</span>
                      </button>
                    )
                  })}
                  <AddSlot label="Add goal" onClick={openGoalCreate} />
                </div>
              </section>

              <section className="lane-section">
                <div className="lane-caption">User steps</div>
                <div className="lane-grid" style={{ gridTemplateColumns: headerGridColumns }}>
                  {columns.map((column) =>
                    column.type === 'step' ? (
                      <button
                        key={column.id}
                        type="button"
                        className={`card step-card ${selection?.id === column.step.id ? 'is-active' : ''}`}
                        onClick={() => openStepEdit(column.step)}
                      >
                        <span>{column.step.title}</span>
                      </button>
                    ) : (
                      <AddSlot
                        key={column.id}
                        label="Add step"
                        onClick={() => openStepCreate(column.goalId)}
                      />
                    ),
                  )}
                  <div className="grid-spacer" />
                </div>
              </section>

              {board.releases.map((release) => (
                <ReleaseBand
                  key={release.id}
                  release={release}
                  columns={columns}
                  stories={board.stories}
                  releaseGridColumns={releaseGridColumns}
                  selection={selection}
                  onReleaseClick={() => openReleaseEdit(release)}
                  onStoryClick={openStoryEdit}
                  onStoryCreate={openStoryCreate}
                />
              ))}

              <section className="release-create-row">
                <AddSlot label="Add release" onClick={openReleaseCreate} stretch />
              </section>
            </div>
          </div>
        </div>
      </main>

      {selection ? (
        <aside className="details-panel">
          <div className="details-header">
            <p className="eyebrow">{selection.mode === 'create' ? 'Create' : 'Edit'}</p>
            <h2>{selection.type}</h2>
          </div>

          <form className="details-form" onSubmit={submitSelection}>
            <PanelFields
              selection={selection}
              goals={board.goals}
              steps={realSteps}
              releases={board.releases}
              onChange={updateDraft}
            />

            <div className="panel-actions">
              <button type="submit" className="primary-button">
                {buttonLabel(selection.mode)}
              </button>
              <button type="button" className="ghost-button" onClick={() => setSelection(null)}>
                Cancel
              </button>
            </div>

            {selection.mode === 'edit' ? (
              <button type="button" className="danger-button" onClick={deleteSelection}>
                Delete
              </button>
            ) : null}
          </form>
        </aside>
      ) : null}
    </div>
  )
}

function ReleaseBand({
  release,
  columns,
  stories,
  releaseGridColumns,
  selection,
  onReleaseClick,
  onStoryClick,
  onStoryCreate,
}) {
  return (
    <section className="release-band">
      <div className="story-grid story-grid-top" style={{ gridTemplateColumns: releaseGridColumns }}>
        {columns.map((column) =>
          column.type === 'step' ? (
            <StoryCell
              key={`${release.id}-${column.id}-above`}
              stories={stories.filter(
                (story) =>
                  story.releaseId === release.id && story.stepId === column.step.id && story.side === 'above',
              )}
              selection={selection}
              onStoryClick={onStoryClick}
              onStoryCreate={() => onStoryCreate(release.id, column.step.id, 'above')}
            />
          ) : (
            <div key={`${release.id}-${column.id}-above`} className="story-cell story-cell-empty" />
          ),
        )}
      </div>

      <div className="release-line-wrap">
        <button
          type="button"
          className={`release-label ${selection?.id === release.id ? 'is-active' : ''}`}
          onClick={onReleaseClick}
        >
          {release.title}
        </button>
        <div className="release-line" />
      </div>

      <div className="story-grid story-grid-bottom" style={{ gridTemplateColumns: releaseGridColumns }}>
        {columns.map((column) =>
          column.type === 'step' ? (
            <StoryCell
              key={`${release.id}-${column.id}-below`}
              stories={stories.filter(
                (story) =>
                  story.releaseId === release.id && story.stepId === column.step.id && story.side === 'below',
              )}
              selection={selection}
              onStoryClick={onStoryClick}
              onStoryCreate={() => onStoryCreate(release.id, column.step.id, 'below')}
            />
          ) : (
            <div key={`${release.id}-${column.id}-below`} className="story-cell story-cell-empty" />
          ),
        )}
      </div>
    </section>
  )
}

function StoryCell({ stories, selection, onStoryClick, onStoryCreate }) {
  return (
    <div className="story-cell">
      {stories.map((story) => (
        <button
          key={story.id}
          type="button"
          className={`card story-card ${selection?.id === story.id ? 'is-active' : ''}`}
          data-priority={story.priority}
          onClick={() => onStoryClick(story)}
        >
          <span className="story-title">{story.title}</span>
          <span className="story-meta">{story.priority}</span>
        </button>
      ))}
      <AddSlot label="Add story" onClick={onStoryCreate} compact />
    </div>
  )
}

function AddSlot({ label, onClick, compact = false, stretch = false }) {
  return (
    <button
      type="button"
      className={`add-slot ${compact ? 'is-compact' : ''} ${stretch ? 'is-stretch' : ''}`.trim()}
      onClick={onClick}
    >
      <span className="add-slot-plus">+</span>
      <span className="add-slot-label">{label}</span>
    </button>
  )
}

function PanelFields({ selection, goals, steps, releases, onChange }) {
  const { type, draft } = selection

  return (
    <>
      <label>
        Title
        <textarea
          rows={type === 'story' ? 4 : 3}
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </label>

      {type === 'goal' ? (
        <label>
          Color
          <select value={draft.color} onChange={(event) => onChange({ color: event.target.value })}>
            {goalPalette.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {type === 'step' ? (
        <label>
          Goal
          <select value={draft.goalId} onChange={(event) => onChange({ goalId: event.target.value })}>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {type === 'story' ? (
        <>
          <label>
            Step
            <select value={draft.stepId} onChange={(event) => onChange({ stepId: event.target.value })}>
              {steps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Release
            <select value={draft.releaseId} onChange={(event) => onChange({ releaseId: event.target.value })}>
              {releases.map((release) => (
                <option key={release.id} value={release.id}>
                  {release.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Placement
            <select value={draft.side} onChange={(event) => onChange({ side: event.target.value })}>
              <option value="above">Above line</option>
              <option value="below">Below line</option>
            </select>
          </label>

          <label>
            Priority
            <select value={draft.priority} onChange={(event) => onChange({ priority: event.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </>
      ) : null}
    </>
  )
}

function normalizeDraft(type, draft) {
  const title = draft.title.trim()

  if (!title) {
    return null
  }

  if (type === 'goal') {
    return { title, color: draft.color || 'sky' }
  }

  if (type === 'step') {
    return { title, goalId: draft.goalId }
  }

  if (type === 'release') {
    return { title }
  }

  if (type === 'story') {
    return {
      title,
      stepId: draft.stepId,
      releaseId: draft.releaseId,
      side: draft.side || 'below',
      priority: draft.priority || 'medium',
    }
  }

  return null
}

export default App
