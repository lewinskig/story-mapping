import { AddSlot } from './shared'
import { GoalsLane } from './GoalsLane'
import { StepsLane } from './StepsLane'
import { ReleaseSection } from './ReleaseSection'
import { CARD_WIDTH, COLUMN_GAP } from '../model/board'

export function BoardPanel({ board, columns, selection, actions }) {
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
          <button type="button" className="ghost-button" onClick={actions.resetBoard}>
            Reset sample board
          </button>
        </header>

        <div className="board-scroll">
          <div className="board-surface" style={{ minWidth: `${boardWidth + CARD_WIDTH + COLUMN_GAP}px` }}>
            <GoalsLane
              goals={board.goals}
              selection={selection}
              gridTemplateColumns={headerGridColumns}
              onCreate={actions.openGoalCreate}
              onEdit={actions.openGoalEdit}
              onDelete={actions.deleteGoal}
              onStartDrag={actions.startDrag}
              onEndDrag={actions.endDrag}
              onDropGoal={actions.dropGoal}
              onDropGoalToEnd={actions.dropGoalToEnd}
            />

            <StepsLane
              columns={columns}
              selection={selection}
              gridTemplateColumns={headerGridColumns}
              onCreate={actions.openStepCreate}
              onEdit={actions.openStepEdit}
              onDelete={actions.deleteStep}
              onStartDrag={actions.startDrag}
              onEndDrag={actions.endDrag}
              onDropStep={actions.dropStep}
            />

            <section className="release-create-row">
              <AddSlot label="Add release" onClick={actions.openReleaseCreate} stretch />
            </section>

            {board.releases.map((release) => (
              <ReleaseSection
                key={release.id}
                release={release}
                columns={columns}
                selection={selection}
                storyGridColumns={storyGridColumns}
                onEdit={actions.openReleaseEdit}
                onDelete={actions.deleteRelease}
                onStoryCreate={actions.openStoryCreate}
                onStoryEdit={actions.openStoryEdit}
                onStoryDelete={actions.deleteStory}
                onStartDrag={actions.startDrag}
                onEndDrag={actions.endDrag}
                onDropStory={actions.dropStory}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
