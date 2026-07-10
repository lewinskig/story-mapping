import { AddSlot } from '../../../shared/ui/AddSlot'
import { CardButton } from '../../../shared/ui/CardButton'

function getHorizontalDropPosition(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  return event.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
}

export function StepsLane({ columns, selection, gridTemplateColumns, onCreate, onEdit, onDelete, onStartDrag, onEndDrag, onDropStep }) {
  return (
    <section className="lane-section">
      <div className="lane-caption">User steps</div>
      <div className="lane-grid" style={{ gridTemplateColumns }}>
        {columns.map((column) =>
          column.type === 'step' ? (
            <CardButton
              key={column.id}
              className={'step-card ' + (selection?.id === column.step.id ? 'is-active' : '')}
              onClick={() => onEdit(column.goal.id, column.step)}
              onDelete={() => onDelete(column.step.id)}
              draggable
              onDragStart={(event) => onStartDrag('step', column.step.id, event)}
              onDragEnd={onEndDrag}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                onDropStep({ goalId: column.goal.id, stepId: column.step.id, position: getHorizontalDropPosition(event) })
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
                onDropStep({ goalId: column.goalId, position: 'end' })
              }}
            />
          ),
        )}
        <div className="grid-spacer" />
      </div>
    </section>
  )
}
