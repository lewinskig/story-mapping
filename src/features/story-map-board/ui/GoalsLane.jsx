import { AddSlot } from '../../../shared/ui/AddSlot'
import { CardButton } from '../../../shared/ui/CardButton'

export function GoalsLane({ goals, selection, gridTemplateColumns, onCreate, onEdit, onDelete, onStartDrag, onEndDrag, onDropGoal, onDropGoalToEnd }) {
  return (
    <section className="lane-section">
      <div className="lane-caption">User goals</div>
      <div className="lane-grid" style={{ gridTemplateColumns }}>
        {goals.flatMap((goal) => {
          const fillers = Array.from({ length: goal.steps.length }, (_, index) => (
            <div key={`${goal.id}-spacer-${index}`} className="goal-spacer" aria-hidden="true" />
          ))

          return [
            <CardButton
              key={goal.id}
              className={`goal-card ${selection?.id === goal.id ? 'is-active' : ''}`}
              dataColor={goal.color}
              onClick={() => onEdit(goal)}
              onDelete={() => onDelete(goal.id)}
              draggable
              onDragStart={() => onStartDrag('goal', goal.id)}
              onDragEnd={onEndDrag}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                onDropGoal(goal.id)
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
            onDropGoalToEnd()
          }}
        />
      </div>
    </section>
  )
}
