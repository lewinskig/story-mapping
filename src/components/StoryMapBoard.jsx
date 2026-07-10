import { AddSlot, CardButton, StorySpacer } from './shared'
import { CARD_WIDTH, COLUMN_GAP, PLANNED_RELEASE_ID } from '../model/board'

export function StoryMapBoard({
  board,
  columns,
  selection,
  onReset,
  onGoalCreate,
  onGoalEdit,
  onGoalDelete,
  onStepCreate,
  onStepEdit,
  onStepDelete,
  onReleaseCreate,
  onReleaseEdit,
  onReleaseDelete,
  onStoryCreate,
  onStoryEdit,
  onStoryDelete,
  onStartDrag,
  onEndDrag,
  onDropGoal,
  onDropGoalToEnd,
  onDropStep,
  onDropStory,
}) {
  const headerGridColumns = `repeat(${Math.max(columns.length + 1, 1)}, ${CARD_WIDTH}px)`
  const storyGridColumns = `repeat(${Math.max(columns.length, 1)}, ${CARD_WIDTH}px)`
  const boardWidth = Math.max((columns.length + 1) * (CARD_WIDTH + COLUMN_GAP) - COLUMN_GAP, CARD_WIDTH)

  return (
    <main className="workspace">
      <div className="board-shell">
        <header className="board-header">
          <div>
            <p className="eyebrow">Story mapping</p>
            <h1>Plan goals, steps and stories on one board.</h1>
          </div>
          <button type="button" className="ghost-button" onClick={onReset}>
            Reset sample board
          </button>
        </header>

        <div className="board-scroll">
          <div className="board-surface" style={{ minWidth: `${boardWidth + CARD_WIDTH + COLUMN_GAP}px` }}>
            <section className="lane-section">
              <div className="lane-caption">User goals</div>
              <div className="lane-grid" style={{ gridTemplateColumns: headerGridColumns }}>
                {board.goals.map((goal) => {
                  const span = Math.max(goal.steps.length, 0) + 1

                  return (
                    <CardButton
                      key={goal.id}
                      className={`goal-card ${selection?.id === goal.id ? 'is-active' : ''}`}
                      dataColor={goal.color}
                      style={{ gridColumn: `span ${span}` }}
                      onClick={() => onGoalEdit(goal)}
                      onDelete={() => onGoalDelete(goal.id)}
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
                  onClick={onGoalCreate}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    onDropGoalToEnd()
                  }}
                />
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
                      onClick={() => onStepEdit(column.goal.id, column.step)}
                      onDelete={() => onStepDelete(column.step.id)}
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
                      onClick={() => onStepCreate(column.goalId)}
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

            <section className="release-create-row">
              <AddSlot label="Add release" onClick={onReleaseCreate} stretch />
            </section>

            {board.releases.map((release) => (
              <ReleaseBand
                key={release.id}
                release={release}
                columns={columns}
                selection={selection}
                onReleaseEdit={() => onReleaseEdit(release)}
                onReleaseDelete={() => onReleaseDelete(release.id)}
                onStoryCreate={onStoryCreate}
                onStoryEdit={onStoryEdit}
                onStoryDelete={onStoryDelete}
                onStartDrag={onStartDrag}
                onEndDrag={onEndDrag}
                onDropStory={onDropStory}
                storyGridColumns={storyGridColumns}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function ReleaseBand({
  release,
  columns,
  selection,
  onReleaseEdit,
  onReleaseDelete,
  onStoryCreate,
  onStoryEdit,
  onStoryDelete,
  onStartDrag,
  onEndDrag,
  onDropStory,
  storyGridColumns,
}) {
  return (
    <section className="release-band">
      <div className="release-line-wrap">
        <button
          type="button"
          className={`release-label ${selection?.id === release.id ? 'is-active' : ''}`}
          onClick={onReleaseEdit}
        >
          {release.name}
          {release.dueDate ? <span className="release-meta">{release.dueDate}</span> : null}
        </button>
        {!release.system ? (
          <button type="button" className="card-delete release-delete" onClick={onReleaseDelete} aria-label={`Delete ${release.name}`}>
            ×
          </button>
        ) : null}
        <div className="release-line" />
      </div>

      <div className="story-grid story-grid-bottom" style={{ gridTemplateColumns: storyGridColumns }}>
        {columns.map((column) =>
          column.type === 'step' ? (
            <StoryCell
              key={`${release.id}-${column.id}`}
              stories={column.step.stories.filter((story) => story.releaseId === release.id)}
              isPlanned={release.id === PLANNED_RELEASE_ID}
              selection={selection}
              onStoryCreate={() => onStoryCreate(release.id, column.step.id)}
              onStoryEdit={onStoryEdit}
              onStoryDelete={onStoryDelete}
              onStartDrag={onStartDrag}
              onEndDrag={onEndDrag}
              onDropStory={(beforeStoryId) =>
                onDropStory({ stepId: column.step.id, releaseId: release.id, beforeStoryId })
              }
            />
          ) : (
            <StorySpacer key={`${release.id}-${column.id}`} />
          ),
        )}
      </div>
    </section>
  )
}

function StoryCell({
  stories,
  isPlanned,
  selection,
  onStoryCreate,
  onStoryEdit,
  onStoryDelete,
  onStartDrag,
  onEndDrag,
  onDropStory,
}) {
  return (
    <div
      className="story-cell"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onDropStory(null)
      }}
    >
      {stories.map((story) => (
        <CardButton
          key={story.id}
          className={`story-card ${selection?.id === story.id ? 'is-active' : ''}`}
          dataPriority={story.priority}
          onClick={() => onStoryEdit(story)}
          onDelete={() => onStoryDelete(story.id)}
          draggable
          onDragStart={() => onStartDrag('story', story.id)}
          onDragEnd={onEndDrag}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            onDropStory(story.id)
          }}
          footer={<span className="story-meta">{story.priority}</span>}
        >
          <span className="story-title">{story.name}</span>
        </CardButton>
      ))}
      <AddSlot label={isPlanned ? 'Add planned story' : 'Add story'} onClick={onStoryCreate} compact />
    </div>
  )
}
