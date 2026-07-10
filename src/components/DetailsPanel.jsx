import { goalPalette, PLANNED_RELEASE_ID } from '../model/board'

function buttonLabel(mode) {
  return mode === 'create' ? 'Add' : 'Update'
}

export function DetailsPanel({ selection, goals, steps, releases, onChange, onSubmit, onCancel, onDelete }) {
  if (!selection) {
    return null
  }

  const { type, draft } = selection
  const deleteDisabled = selection.mode !== 'edit' || (type === 'release' && selection.id === PLANNED_RELEASE_ID)

  return (
    <aside className="details-panel">
      <div className="details-header">
        <p className="eyebrow">{selection.mode === 'create' ? 'Create' : 'Edit'}</p>
        <h2>{type}</h2>
      </div>

      <form className="details-form" onSubmit={onSubmit}>
        <label>
          Name
          <textarea
            rows={type === 'story' ? 4 : 3}
            value={draft.name}
            onChange={(event) => onChange({ name: event.target.value })}
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
                  {goal.name}
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
                    {step.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Release
              <select value={draft.releaseId} onChange={(event) => onChange({ releaseId: event.target.value })}>
                {releases.map((release) => (
                  <option key={release.id} value={release.id}>
                    {release.name}
                  </option>
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

        {type === 'release' ? (
          <label>
            Due date
            <input
              type="date"
              value={draft.dueDate || ''}
              onChange={(event) => onChange({ dueDate: event.target.value })}
            />
          </label>
        ) : null}

        <div className="panel-actions">
          <button type="submit" className="primary-button">
            {buttonLabel(selection.mode)}
          </button>
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        </div>

        {!deleteDisabled ? (
          <div className="danger-zone">
            <button type="button" className="danger-link" onClick={onDelete}>
              Delete this {type}
            </button>
          </div>
        ) : null}
      </form>
    </aside>
  )
}
