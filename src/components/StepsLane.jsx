import { AddSlot } from './AddSlot'
import { CardButton } from './CardButton'

export function StepsLane({ columns, selection, gridTemplateColumns, onCreate, onEdit, onDelete, onStartDrag, onEndDrag, onDropStep }) {
  return (
    <section className="lane-section">
      <div className="lane-caption">User steps</div>
      <div className="lane-grid" style={{ gridTemplateColumns }}>
        {columns.map((column) =>
          column.type === 'step' ? (
            <CardButton
              key={column.id}
              className={`step-card ${selection?.id === column.step.id ? 'is-active' : ''}`}
              onClick={() => onEdit(column.goal.id, column.step)}
              onDelete={() => onDelete(column.step.id)}
              draggable
              onDragStart={() => onStartDrag('step', column.step.id)}
              onDragEnd={onEndDrag}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                onDropStep({ goalId: column.goal.id, beforeStepId: column.step.id })
              }}
            >
              {column.step.name}
            </CardButton>
          ) : (
            <AddSlot
              key={column.id}
              label="Add step"
              onClick={() => onCreate(column.goalId)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                onDropStep({ goalId: column.goalId, beforeStepId: null })
              }}
            />
          ),
        )}
        <div className="grid-spacer" />
      </div>
    </section>
  )
}
