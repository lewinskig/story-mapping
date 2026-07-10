import { AddSlot, CardButton } from './shared'

export function GoalsLane({ goals, selection, gridTemplateColumns, onCreate, onEdit, onDelete, onStartDrag, onEndDrag, onDropGoal, onDropGoalToEnd }) {
  return (
    <section className="lane-section">
      <div className="lane-caption">User goals</div>
      <div className="lane-grid" style={{ gridTemplateColumns }}>
        {goals.map((goal) => {
          const span = Math.max(goal.steps.length, 0) + 1

          return (
            <CardButton
              key={goal.id}
              className={`goal-card ${selection?.id === goal.id ? 'is-active' : ''}`}
              dataColor={goal.color}
              style={{ gridColumn: `span ${span}` }}
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
            </CardButton>
          )
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
