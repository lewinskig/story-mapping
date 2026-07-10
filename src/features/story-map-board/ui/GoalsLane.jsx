import { AddSlot } from '../../../shared/ui/AddSlot'
import { CardButton } from '../../../shared/ui/CardButton'

function getHorizontalDropPosition(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  return event.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
}

export function GoalsLane({ goals, selection, gridTemplateColumns, onCreate, onEdit, onDelete, onStartDrag, onEndDrag, onDropGoal }) {
  return (
    <section className="lane-section">
      <div className="lane-caption">User goals</div>
      <div className="lane-grid" style={{ gridTemplateColumns }}>
        {goals.flatMap((goal) => {
          const fillers = Array.from({ length: goal.steps.length }, (_, index) => (
            <div key={goal.id + '-spacer-' + index} className="goal-spacer" aria-hidden="true" />
          ))

          return [
            <CardButton
              key={goal.id}
              className={'goal-card ' + (selection?.id === goal.id ? 'is-active' : '')}
              dataColor={goal.color}
              onClick={() => onEdit(goal)}
              onDelete={() => onDelete(goal.id)}
              draggable
              onDragStart={(event) => onStartDrag('goal', goal.id, event)}
              onDragEnd={onEndDrag}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                onDropGoal({ goalId: goal.id, position: getHorizontalDropPosition(event) })
              }}
            >
              {goal.name}
            </CardButton>,
            ...fillers,
          ]
        })}
        <AddSlot
          label="Add goal"
          onClick={onCreate}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            onDropGoal({ position: 'end' })
          }}
        />
      </div>
    </section>
  )
}
