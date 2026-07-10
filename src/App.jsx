import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'story-mapping-board-v4'
const CARD_WIDTH = 144
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
    { id: 'st1', releaseId: null, stepId: 's1', title: 'View restaurant list', priority: 'high' },
    { id: 'st2', releaseId: null, stepId: 's2', title: 'Browse menu categories', priority: 'high' },
    { id: 'st3', releaseId: 'r1', stepId: 's3', title: 'Add items to cart', priority: 'medium' },
    { id: 'st4', releaseId: 'r1', stepId: 's4', title: 'Track order in real time', priority: 'high' },
    { id: 'st5', releaseId: 'r1', stepId: 's6', title: 'Access contact details', priority: 'medium' },
    { id: 'st6', releaseId: 'r2', stepId: 's2', title: 'Customize food item', priority: 'low' },
    { id: 'st7', releaseId: 'r2', stepId: 's4', title: 'Receive delivery notifications', priority: 'medium' },
    { id: 'st8', releaseId: null, stepId: 's7', title: 'Submit feedback or suggestions', priority: 'low' },
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

function getEntity(board, type, id) {
  if (!id) return null
  if (type === 'goal') return board.goals.find((item) => item.id === id) || null
  if (type === 'step') return board.steps.find((item) => item.id === id) || null
  if (type === 'release') return board.releases.find((item) => item.id === id) || null
  if (type === 'story') return board.stories.find((item) => item.id === id) || null
  return null
}

function moveGoal(goals, movingId, targetId) {
  if (movingId === targetId) return goals

  const fromIndex = goals.findIndex((goal) => goal.id === movingId)
  const targetIndex = goals.findIndex((goal) => goal.id === targetId)

  if (fromIndex === -1 || targetIndex === -1) return goals

  const moving = goals[fromIndex]
  const remaining = goals.filter((goal) => goal.id !== movingId)
  const adjustedTarget = fromIndex < targetIndex ? targetIndex : targetIndex - 1

  return [
    ...remaining.slice(0, adjustedTarget + 1),
    moving,
    ...remaining.slice(adjustedTarget + 1),
  ]
}

function moveToEnd(items, movingId) {
  const moving = items.find((item) => item.id === movingId)
  if (!moving) return items
  const remaining = items.filter((item) => item.id !== movingId)
  return [...remaining, moving]
}

function moveBefore(items, movingId, targetId, patch = {}) {
  if (movingId === targetId) return items

  const moving = items.find((item) => item.id === movingId)
  const insertIndex = items.findIndex((item) => item.id === targetId)

  if (!moving || insertIndex === -1) return items

  const remaining = items.filter((item) => item.id !== movingId)
  const nextIndex = remaining.findIndex((item) => item.id === targetId)

  return [
    ...remaining.slice(0, nextIndex),
    { ...moving, ...patch },
    ...remaining.slice(nextIndex),
  ]
}

function appendStepToGoal(steps, movingId, goalId) {
  const moving = steps.find((step) => step.id === movingId)
  if (!moving) return steps

  const remaining = steps.filter((step) => step.id !== movingId)
  const updated = { ...moving, goalId }
  const insertAfter = remaining.reduce((lastIndex, step, index) => {
    return step.goalId === goalId ? index : lastIndex
  }, -1)

  if (insertAfter === -1) {
    return [...remaining, updated]
  }

  return [
    ...remaining.slice(0, insertAfter + 1),
    updated,
    ...remaining.slice(insertAfter + 1),
  ]
}

function moveStory(stories, movingId, target) {
  const moving = stories.find((story) => story.id === movingId)
  if (!moving) return stories

  const remaining = stories.filter((story) => story.id !== movingId)
  const updated = {
    ...moving,
    releaseId: target.releaseId,
    stepId: target.stepId,
  }

  if (target.beforeStoryId) {
    const insertIndex = remaining.findIndex((story) => story.id === target.beforeStoryId)

    if (insertIndex !== -1) {
      return [
        ...remaining.slice(0, insertIndex),
        updated,
        ...remaining.slice(insertIndex),
      ]
    }
  }

  const lastMatch = remaining.reduce((lastIndex, story, index) => {
    return story.releaseId === target.releaseId && story.stepId === target.stepId ? index : lastIndex
  }, -1)

  if (lastMatch === -1) {
    return [...remaining, updated]
  }

  return [
    ...remaining.slice(0, lastMatch + 1),
    updated,
    ...remaining.slice(lastMatch + 1),
  ]
}

function App() {
  const [board, setBoard] = useState(loadBoard)
  const [selection, setSelection] = useState(null)
  const [dragState, setDragState] = useState(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  }, [board])

  useEffect(() => {
    if (!selection || selection.mode !== 'edit') return

    const entity = getEntity(board, selection.type, selection.id)
    if (!entity) {
      setSelection(null)
      return
    }

    setSelection((current) => {
      if (!current || current.mode !== 'edit') return current
      return { ...current, draft: { ...entity } }
    })
  }, [board, selection?.id, selection?.mode, selection?.type])

  const columns = useMemo(() => buildColumns(board.goals, board.steps), [board.goals, board.steps])
  const stepColumns = useMemo(() => columns.filter((column) => column.type === 'step'), [columns])
  const realSteps = useMemo(
    () => board.goals.flatMap((goal) => board.steps.filter((step) => step.goalId === goal.id)),
    [board.goals, board.steps],
  )

  const headerGridColumns = `repeat(${Math.max(columns.length + 1, 1)}, ${CARD_WIDTH}px)`
  const releaseGridColumns = `repeat(${Math.max(columns.length, 1)}, ${CARD_WIDTH}px)`
  const boardWidth = Math.max((columns.length + 1) * (CARD_WIDTH + COLUMN_GAP) - COLUMN_GAP, CARD_WIDTH)

  function resetBoard() {
    setBoard(seedData)
    setSelection(null)
    setDragState(null)
  }

  function openGoalCreate() {
    setSelection(createSelection('create', 'goal', { title: '', color: goalPalette[board.goals.length % goalPalette.length] }))
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

  function openStoryCreate(releaseId, stepId) {
    setSelection(createSelection('create', 'story', { title: '', releaseId, stepId, priority: 'medium' }))
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
        setBoard((current) => ({ ...current, goals: [...current.goals, { id: uid('goal'), ...draft }] }))
      }
      if (selection.type === 'step') {
        setBoard((current) => ({ ...current, steps: [...current.steps, { id: uid('step'), ...draft }] }))
      }
      if (selection.type === 'release') {
        setBoard((current) => ({ ...current, releases: [{ id: uid('release'), ...draft }, ...current.releases] }))
      }
      if (selection.type === 'story') {
        setBoard((current) => ({ ...current, stories: [...current.stories, { id: uid('story'), ...draft }] }))
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
        releases: current.releases.map((release) => (release.id === selection.id ? { ...release, ...draft } : release)),
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

  function deleteEntity(type, id) {
    if (type === 'goal') {
      setBoard((current) => {
        const stepIds = current.steps.filter((step) => step.goalId === id).map((step) => step.id)
        return {
          goals: current.goals.filter((goal) => goal.id !== id),
          steps: current.steps.filter((step) => step.goalId !== id),
          releases: current.releases,
          stories: current.stories.filter((story) => !stepIds.includes(story.stepId)),
        }
      })
    }
    if (type === 'step') {
      setBoard((current) => ({
        ...current,
        steps: current.steps.filter((step) => step.id !== id),
        stories: current.stories.filter((story) => story.stepId !== id),
      }))
    }
    if (type === 'release') {
      setBoard((current) => ({
        ...current,
        releases: current.releases.filter((release) => release.id !== id),
        stories: current.stories.map((story) => (story.releaseId === id ? { ...story, releaseId: null } : story)),
      }))
    }
    if (type === 'story') {
      setBoard((current) => ({
        ...current,
        stories: current.stories.filter((story) => story.id !== id),
      }))
    }

    setSelection((current) => (current?.id === id && current?.type === type ? null : current))
  }

  function startDrag(type, id) {
    setDragState({ type, id })
  }

  function endDrag() {
    setDragState(null)
  }

  function dropGoal(targetGoalId) {
    if (!dragState || dragState.type !== 'goal') return
    setBoard((current) => ({ ...current, goals: moveGoal(current.goals, dragState.id, targetGoalId) }))
    setDragState(null)
  }

  function dropGoalToEnd() {
    if (!dragState || dragState.type !== 'goal') return
    setBoard((current) => ({ ...current, goals: moveToEnd(current.goals, dragState.id) }))
    setDragState(null)
  }

  function dropStepOnStep(targetStep) {
    if (!dragState || dragState.type !== 'step') return
    setBoard((current) => ({
      ...current,
      steps: moveBefore(current.steps, dragState.id, targetStep.id, { goalId: targetStep.goalId }),
    }))
    setDragState(null)
  }

  function dropStepOnGoal(goalId) {
    if (!dragState || dragState.type !== 'step') return
    setBoard((current) => ({ ...current, steps: appendStepToGoal(current.steps, dragState.id, goalId) }))
    setDragState(null)
  }

  function dropStory(target) {
    if (!dragState || dragState.type !== 'story') return
    setBoard((current) => ({ ...current, stories: moveStory(current.stories, dragState.id, target) }))
    setDragState(null)
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
                      <CardButton
                        key={goal.id}
                        className={`goal-card ${selection?.id === goal.id ? 'is-active' : ''}`}
                        dataColor={goal.color}
                        style={{ gridColumn: `span ${span}` }}
                        onClick={() => openGoalEdit(goal)}
                        onDelete={() => deleteEntity('goal', goal.id)}
                        draggable
                        onDragStart={() => startDrag('goal', goal.id)}
                        onDragEnd={endDrag}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          dropGoal(goal.id)
                        }}
                      >
                        {goal.title}
                      </CardButton>
                    )
                  })}
                  <AddSlot label="Add goal" onClick={openGoalCreate} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
                    event.preventDefault()
                    dropGoalToEnd()
                  }} />
                </div>
              </section>

              <section className="lane-section">
                <div className="lane-caption">User steps</div>
                <div className="lane-grid" style={{ gridTemplateColumns: headerGridColumns }}>
                  {columns.map((column) =>
                    column.type === 'step' ? (
                      <CardButton
                        key={column.id}
                        className={`step-card ${selection?.id === column.step.id ? 'is-active' : ''}`}
                        onClick={() => openStepEdit(column.step)}
                        onDelete={() => deleteEntity('step', column.step.id)}
                        draggable
                        onDragStart={() => startDrag('step', column.step.id)}
                        onDragEnd={endDrag}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          dropStepOnStep(column.step)
                        }}
                      >
                        {column.step.title}
                      </CardButton>
                    ) : (
                      <AddSlot
                        key={column.id}
                        label="Add step"
                        onClick={() => openStepCreate(column.goalId)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          dropStepOnGoal(column.goalId)
                        }}
                      />
                    ),
                  )}
                  <div className="grid-spacer" />
                </div>
              </section>

              <section className="lane-section">
                <div className="lane-caption">Unassigned stories</div>
                <div className="story-grid" style={{ gridTemplateColumns: releaseGridColumns }}>
                  {columns.map((column) =>
                    column.type === 'step' ? (
                      <StoryCell
                        key={`top-${column.id}`}
                        stories={board.stories.filter((story) => story.stepId === column.step.id && story.releaseId == null)}
                        selection={selection}
                        onStoryClick={openStoryEdit}
                        onStoryCreate={() => openStoryCreate(null, column.step.id)}
                        onStoryDrop={(target) => dropStory({ ...target, releaseId: null, stepId: column.step.id })}
                        onDragStart={startDrag}
                        onDragEnd={endDrag}
                        onDeleteStory={(id) => deleteEntity('story', id)}
                      />
                    ) : (
                      <StorySpacer key={`top-${column.id}`} />
                    ),
                  )}
                </div>
              </section>

              <section className="release-create-row">
                <AddSlot label="Add release" onClick={openReleaseCreate} stretch />
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
                  onReleaseDelete={() => deleteEntity('release', release.id)}
                  onStoryClick={openStoryEdit}
                  onStoryCreate={openStoryCreate}
                  onStoryDrop={dropStory}
                  onDragStart={startDrag}
                  onDragEnd={endDrag}
                  onDeleteStory={(id) => deleteEntity('story', id)}
                />
              ))}
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
            <PanelFields selection={selection} goals={board.goals} steps={realSteps} releases={board.releases} onChange={updateDraft} />

            <div className="panel-actions">
              <button type="submit" className="primary-button">{buttonLabel(selection.mode)}</button>
              <button type="button" className="ghost-button" onClick={() => setSelection(null)}>Cancel</button>
            </div>

            {selection.mode === 'edit' ? (
              <div className="danger-zone">
                <button type="button" className="danger-link" onClick={() => deleteEntity(selection.type, selection.id)}>
                  Delete this {selection.type}
                </button>
              </div>
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
  onReleaseDelete,
  onStoryClick,
  onStoryCreate,
  onStoryDrop,
  onDragStart,
  onDragEnd,
  onDeleteStory,
}) {
  return (
    <section className="release-band">
      <div className="release-line-wrap">
        <button type="button" className={`release-label ${selection?.id === release.id ? 'is-active' : ''}`} onClick={onReleaseClick}>
          {release.title}
        </button>
        <button type="button" className="card-delete release-delete" onClick={onReleaseDelete} aria-label={`Delete ${release.title}`}>
          ×
        </button>
        <div className="release-line" />
      </div>

      <div className="story-grid story-grid-bottom" style={{ gridTemplateColumns: releaseGridColumns }}>
        {columns.map((column) =>
          column.type === 'step' ? (
            <StoryCell
              key={`${release.id}-${column.id}`}
              stories={stories.filter((story) => story.releaseId === release.id && story.stepId === column.step.id)}
              selection={selection}
              onStoryClick={onStoryClick}
              onStoryCreate={() => onStoryCreate(release.id, column.step.id)}
              onStoryDrop={(target) => onStoryDrop({ ...target, releaseId: release.id, stepId: column.step.id })}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDeleteStory={onDeleteStory}
            />
          ) : (
            <StorySpacer key={`${release.id}-${column.id}`} />
          ),
        )}
      </div>
    </section>
  )
}

function StorySpacer() {
  return <div className="story-cell story-spacer" aria-hidden="true" />
}

function StoryCell({
  stories,
  selection,
  onStoryClick,
  onStoryCreate,
  onStoryDrop,
  onDragStart,
  onDragEnd,
  onDeleteStory,
}) {
  return (
    <div
      className="story-cell"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onStoryDrop({ beforeStoryId: null })
      }}
    >
      {stories.map((story) => (
        <CardButton
          key={story.id}
          className={`story-card ${selection?.id === story.id ? 'is-active' : ''}`}
          dataPriority={story.priority}
          onClick={() => onStoryClick(story)}
          onDelete={() => onDeleteStory(story.id)}
          draggable
          onDragStart={() => onDragStart('story', story.id)}
          onDragEnd={onDragEnd}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            onStoryDrop({ beforeStoryId: story.id })
          }}
          footer={<span className="story-meta">{story.priority}</span>}
        >
          <span className="story-title">{story.title}</span>
        </CardButton>
      ))}
      <AddSlot label="Add story" onClick={onStoryCreate} compact />
    </div>
  )
}

function CardButton({
  children,
  className,
  dataColor,
  dataPriority,
  onClick,
  onDelete,
  footer,
  style,
  ...dragProps
}) {
  return (
    <button type="button" className={`card ${className}`.trim()} data-color={dataColor} data-priority={dataPriority} onClick={onClick} style={style} {...dragProps}>
      {onDelete ? (
        <span className="card-delete" onClick={(event) => {
          event.stopPropagation()
          onDelete()
        }}>
          ×
        </span>
      ) : null}
      <span>{children}</span>
      {footer}
    </button>
  )
}

function AddSlot({ label, onClick, compact = false, stretch = false, onDragOver, onDrop }) {
  return (
    <button
      type="button"
      className={`add-slot ${compact ? 'is-compact' : ''} ${stretch ? 'is-stretch' : ''}`.trim()}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
        <textarea rows={type === 'story' ? 4 : 3} value={draft.title} onChange={(event) => onChange({ title: event.target.value })} />
      </label>

      {type === 'goal' ? (
        <label>
          Color
          <select value={draft.color} onChange={(event) => onChange({ color: event.target.value })}>
            {goalPalette.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </label>
      ) : null}

      {type === 'step' ? (
        <label>
          Goal
          <select value={draft.goalId} onChange={(event) => onChange({ goalId: event.target.value })}>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
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
                <option key={step.id} value={step.id}>{step.title}</option>
              ))}
            </select>
          </label>

          <label>
            Release
            <select value={draft.releaseId ?? ''} onChange={(event) => onChange({ releaseId: event.target.value || null })}>
              <option value="">Unassigned</option>
              {releases.map((release) => (
                <option key={release.id} value={release.id}>{release.title}</option>
              ))}
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
  if (!title) return null

  if (type === 'goal') return { title, color: draft.color || 'sky' }
  if (type === 'step') return { title, goalId: draft.goalId }
  if (type === 'release') return { title }
  if (type === 'story') {
    return {
      title,
      stepId: draft.stepId,
      releaseId: draft.releaseId || null,
      priority: draft.priority || 'medium',
    }
  }

  return null
}

export default App
