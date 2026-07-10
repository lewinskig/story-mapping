import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'story-mapping-board-v1'

const goalPalette = ['sky', 'mint', 'peach', 'gold', 'lavender']

const seedData = {
  goals: [
    { id: 'g1', title: 'Create and Manage Roadmaps', color: 'sky' },
    { id: 'g2', title: 'Share Roadmaps with Clients', color: 'mint' },
    { id: 'g3', title: 'Track Progress', color: 'peach' },
  ],
  steps: [
    { id: 's1', goalId: 'g1', title: 'Create new roadmap' },
    { id: 's2', goalId: 'g1', title: 'Customize roadmap' },
    { id: 's3', goalId: 'g2', title: 'Invite collaborators' },
    { id: 's4', goalId: 'g2', title: 'Share secure link' },
    { id: 's5', goalId: 'g3', title: 'Track completion' },
    { id: 's6', goalId: 'g3', title: 'Report status' },
  ],
  releases: [
    { id: 'r1', title: 'MVP' },
    { id: 'r2', title: 'Release 2' },
    { id: 'r3', title: 'Release 3' },
  ],
  stories: [
    { id: 'st1', releaseId: 'r1', stepId: 's1', title: 'Select template', priority: 'high' },
    { id: 'st2', releaseId: 'r1', stepId: 's2', title: 'Add custom fields', priority: 'high' },
    { id: 'st3', releaseId: 'r1', stepId: 's3', title: 'Invite team by email', priority: 'medium' },
    { id: 'st4', releaseId: 'r1', stepId: 's4', title: 'Generate shareable link', priority: 'medium' },
    { id: 'st5', releaseId: 'r2', stepId: 's2', title: 'Theme colors and branding', priority: 'low' },
    { id: 'st6', releaseId: 'r2', stepId: 's3', title: 'Permission roles', priority: 'medium' },
    { id: 'st7', releaseId: 'r2', stepId: 's5', title: 'Mark tasks complete', priority: 'high' },
    { id: 'st8', releaseId: 'r3', stepId: 's4', title: 'Client view preferences', priority: 'low' },
    { id: 'st9', releaseId: 'r3', stepId: 's6', title: 'Progress report export', priority: 'medium' },
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

function EditableCard({ value, onChange, className = '', tone = 'default' }) {
  return (
    <textarea
      className={`editable-card ${className}`.trim()}
      data-tone={tone}
      rows={3}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function App() {
  const [board, setBoard] = useState(loadBoard)
  const [draftGoal, setDraftGoal] = useState('')
  const [draftStep, setDraftStep] = useState('')
  const [draftRelease, setDraftRelease] = useState('')
  const [draftStory, setDraftStory] = useState({
    title: '',
    stepId: '',
    releaseId: '',
    priority: 'medium',
  })
  const [focus, setFocus] = useState({ stepId: '', releaseId: '' })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  }, [board])

  const stepColumns = useMemo(
    () =>
      board.goals.flatMap((goal) => board.steps.filter((step) => step.goalId === goal.id)),
    [board.goals, board.steps],
  )

  const gridTemplateColumns = `220px repeat(${Math.max(stepColumns.length, 1)}, minmax(220px, 1fr))`

  const totals = {
    goals: board.goals.length,
    steps: board.steps.length,
    releases: board.releases.length,
    stories: board.stories.length,
  }

  function updateEntity(collection, id, patch) {
    setBoard((current) => ({
      ...current,
      [collection]: current[collection].map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }))
  }

  function addGoal(event) {
    event.preventDefault()
    if (!draftGoal.trim()) return

    setBoard((current) => ({
      ...current,
      goals: [
        ...current.goals,
        {
          id: uid('goal'),
          title: draftGoal.trim(),
          color: goalPalette[current.goals.length % goalPalette.length],
        },
      ],
    }))
    setDraftGoal('')
  }

  function addStep(event) {
    event.preventDefault()
    if (!draftStep.trim() || !board.goals[0]) return

    setBoard((current) => ({
      ...current,
      steps: [
        ...current.steps,
        {
          id: uid('step'),
          goalId: focus.stepId
            ? current.steps.find((step) => step.id === focus.stepId)?.goalId || current.goals[0].id
            : current.goals[0].id,
          title: draftStep.trim(),
        },
      ],
    }))
    setDraftStep('')
  }

  function addRelease(event) {
    event.preventDefault()
    if (!draftRelease.trim()) return

    setBoard((current) => ({
      ...current,
      releases: [...current.releases, { id: uid('release'), title: draftRelease.trim() }],
    }))
    setDraftRelease('')
  }

  function addStory(event) {
    event.preventDefault()
    const title = draftStory.title.trim()
    const stepId = draftStory.stepId || focus.stepId || stepColumns[0]?.id
    const releaseId = draftStory.releaseId || focus.releaseId || board.releases[0]?.id

    if (!title || !stepId || !releaseId) return

    setBoard((current) => ({
      ...current,
      stories: [
        ...current.stories,
        {
          id: uid('story'),
          title,
          stepId,
          releaseId,
          priority: draftStory.priority,
        },
      ],
    }))
    setDraftStory({ title: '', stepId, releaseId, priority: draftStory.priority })
  }

  function removeGoal(goalId) {
    setBoard((current) => {
      const stepIds = current.steps.filter((step) => step.goalId === goalId).map((step) => step.id)

      return {
        goals: current.goals.filter((goal) => goal.id !== goalId),
        steps: current.steps.filter((step) => step.goalId !== goalId),
        releases: current.releases,
        stories: current.stories.filter((story) => !stepIds.includes(story.stepId)),
      }
    })
  }

  function removeStep(stepId) {
    setBoard((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== stepId),
      stories: current.stories.filter((story) => story.stepId !== stepId),
    }))
  }

  function removeRelease(releaseId) {
    setBoard((current) => ({
      ...current,
      releases: current.releases.filter((release) => release.id !== releaseId),
      stories: current.stories.filter((story) => story.releaseId !== releaseId),
    }))
  }

  function removeStory(storyId) {
    setBoard((current) => ({
      ...current,
      stories: current.stories.filter((story) => story.id !== storyId),
    }))
  }

  function resetBoard() {
    setBoard(seedData)
    setFocus({ stepId: '', releaseId: '' })
    setDraftStory({ title: '', stepId: '', releaseId: '', priority: 'medium' })
  }

  return (
    <div className="app-shell">
      <aside className="control-panel">
        <div className="panel-head">
          <p className="eyebrow">Story Mapping</p>
          <h1>One board for goals, steps and releases.</h1>
          <p className="lede">
            Ukladaj narracyjny plan projektu: od celow uzytkownika, przez kroki, do user stories
            w kolejnych wydaniach.
          </p>
        </div>

        <div className="stats">
          <div>
            <strong>{totals.goals}</strong>
            <span>goals</span>
          </div>
          <div>
            <strong>{totals.steps}</strong>
            <span>steps</span>
          </div>
          <div>
            <strong>{totals.releases}</strong>
            <span>releases</span>
          </div>
          <div>
            <strong>{totals.stories}</strong>
            <span>stories</span>
          </div>
        </div>

        <form className="mini-form" onSubmit={addGoal}>
          <label htmlFor="goal-input">New goal</label>
          <input
            id="goal-input"
            value={draftGoal}
            onChange={(event) => setDraftGoal(event.target.value)}
            placeholder="Example: Improve onboarding"
          />
          <button type="submit">Add goal</button>
        </form>

        <form className="mini-form" onSubmit={addStep}>
          <label htmlFor="step-input">New step</label>
          <input
            id="step-input"
            value={draftStep}
            onChange={(event) => setDraftStep(event.target.value)}
            placeholder="Example: Invite team"
          />
          <p className="hint">Step trafi do pierwszego goalu lub goalu aktywnego kroku.</p>
          <button type="submit">Add step</button>
        </form>

        <form className="mini-form" onSubmit={addRelease}>
          <label htmlFor="release-input">New release</label>
          <input
            id="release-input"
            value={draftRelease}
            onChange={(event) => setDraftRelease(event.target.value)}
            placeholder="Example: Release 4"
          />
          <button type="submit">Add release</button>
        </form>

        <form className="mini-form story-form" onSubmit={addStory}>
          <label htmlFor="story-input">New story</label>
          <textarea
            id="story-input"
            rows={3}
            value={draftStory.title}
            onChange={(event) => setDraftStory((current) => ({ ...current, title: event.target.value }))}
            placeholder="Example: Allow template duplication"
          />
          <select
            value={draftStory.stepId || focus.stepId}
            onChange={(event) => setDraftStory((current) => ({ ...current, stepId: event.target.value }))}
          >
            <option value="">Select step</option>
            {stepColumns.map((step) => (
              <option key={step.id} value={step.id}>
                {step.title}
              </option>
            ))}
          </select>
          <select
            value={draftStory.releaseId || focus.releaseId}
            onChange={(event) => setDraftStory((current) => ({ ...current, releaseId: event.target.value }))}
          >
            <option value="">Select release</option>
            {board.releases.map((release) => (
              <option key={release.id} value={release.id}>
                {release.title}
              </option>
            ))}
          </select>
          <select
            value={draftStory.priority}
            onChange={(event) => setDraftStory((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <button type="submit">Add story</button>
        </form>

        <button className="ghost-button" type="button" onClick={resetBoard}>
          Reset sample board
        </button>
      </aside>

      <main className="board-wrap">
        <section className="legend">
          <div>
            <span className="legend-marker goals" />
            <strong>User goals</strong>
          </div>
          <div>
            <span className="legend-marker steps" />
            <strong>User steps</strong>
          </div>
          <div>
            <span className="legend-marker stories" />
            <strong>User stories by release</strong>
          </div>
        </section>

        <section className="board">
          <div className="board-grid" style={{ gridTemplateColumns }}>
            <div className="axis-label axis-top">Narrative flow</div>
            {board.goals.map((goal) => {
              const count = Math.max(board.steps.filter((step) => step.goalId === goal.id).length, 1)

              return (
                <div
                  key={goal.id}
                  className="goal-block"
                  style={{ gridColumn: `span ${count}` }}
                  data-color={goal.color}
                >
                  <EditableCard
                    value={goal.title}
                    onChange={(title) => updateEntity('goals', goal.id, { title })}
                    tone="goal"
                  />
                  <button type="button" className="icon-button" onClick={() => removeGoal(goal.id)}>
                    ×
                  </button>
                </div>
              )
            })}

            <div className="axis-label axis-mid">User steps</div>
            {stepColumns.map((step) => (
              <div
                key={step.id}
                className={`step-block ${focus.stepId === step.id ? 'is-active' : ''}`}
                onClick={() => setFocus((current) => ({ ...current, stepId: step.id }))}
              >
                <EditableCard
                  value={step.title}
                  onChange={(title) => updateEntity('steps', step.id, { title })}
                  tone="step"
                />
                <button type="button" className="icon-button" onClick={() => removeStep(step.id)}>
                  ×
                </button>
              </div>
            ))}

            {board.releases.map((release) => (
              <FragmentRow
                key={release.id}
                release={release}
                stepColumns={stepColumns}
                stories={board.stories}
                focus={focus}
                setFocus={setFocus}
                updateEntity={updateEntity}
                removeRelease={removeRelease}
                removeStory={removeStory}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function FragmentRow({
  release,
  stepColumns,
  stories,
  focus,
  setFocus,
  updateEntity,
  removeRelease,
  removeStory,
}) {
  return (
    <>
      <div className={`release-label ${focus.releaseId === release.id ? 'is-active' : ''}`}>
        <EditableCard
          value={release.title}
          onChange={(title) => updateEntity('releases', release.id, { title })}
          className="release-editor"
          tone="release"
        />
        <button type="button" className="icon-button" onClick={() => removeRelease(release.id)}>
          ×
        </button>
      </div>
      {stepColumns.map((step) => {
        const cellStories = stories.filter(
          (story) => story.releaseId === release.id && story.stepId === step.id,
        )

        return (
          <div
            key={`${release.id}-${step.id}`}
            className={`story-cell ${
              focus.releaseId === release.id && focus.stepId === step.id ? 'is-active' : ''
            }`}
            onClick={() => setFocus({ releaseId: release.id, stepId: step.id })}
          >
            {cellStories.map((story) => (
              <article key={story.id} className="story-note" data-priority={story.priority}>
                <span className="priority-tag">{story.priority}</span>
                <EditableCard
                  value={story.title}
                  onChange={(title) => updateEntity('stories', story.id, { title })}
                  className="story-editor"
                />
                <button type="button" className="icon-button" onClick={() => removeStory(story.id)}>
                  ×
                </button>
              </article>
            ))}
          </div>
        )
      })}
    </>
  )
}

export default App
