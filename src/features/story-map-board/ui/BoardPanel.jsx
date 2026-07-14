import { GoalsLane } from './GoalsLane'
import { StepsLane } from './StepsLane'
import { ReleaseSection } from './ReleaseSection'
import { CARD_WIDTH, COLUMN_GAP } from '../../../entities/story-map/domain/constants'

export function BoardPanel({ storyMap, columns, selection, persistence, actions }) {
  const headerGridColumns = `repeat(${Math.max(columns.length + 1, 1)}, ${CARD_WIDTH}px)`
  const storyGridColumns = `repeat(${Math.max(columns.length, 1)}, ${CARD_WIDTH}px)`
  const boardWidth = Math.max((columns.length + 1) * (CARD_WIDTH + COLUMN_GAP) - COLUMN_GAP, CARD_WIDTH)
  const saveLabel = persistence.saveStatus === 'saving' ? 'Saving...' : persistence.isDirty ? 'Save *' : 'Save'

  return (
    <main className="workspace">
      <div className="board-shell">
        <header className="board-header">
          <div>
            <p className="eyebrow">Story mapping</p>
            <h1>Plan goals, steps and stories on one board.</h1>
            <div className="board-status">
              <span>Board: {persistence.currentBoardId}</span>
              {persistence.error ? <span className="board-status-error">{persistence.error}</span> : null}
            </div>
          </div>
          <div className="board-header-actions">
            <select
              className="board-select"
              value={persistence.selectedBoardId}
              onChange={(event) => actions.selectBoard(event.target.value)}
              disabled={persistence.loadStatus === 'loading'}
            >
              {persistence.boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
            <button type="button" className="ghost-button" onClick={actions.loadSelectedBoard} disabled={!persistence.selectedBoardId || persistence.loadStatus === 'loading'}>
              Load
            </button>
            <button type="button" className="primary-button" onClick={actions.saveBoard} disabled={persistence.saveStatus === 'saving'}>
              {saveLabel}
            </button>
            <button type="button" className="ghost-button" onClick={actions.saveBoardAs} disabled={persistence.saveStatus === 'saving'}>
              Save as
            </button>
            <button type="button" className="ghost-button" onClick={actions.openReleaseCreate}>
              Add release
            </button>
            <button type="button" className="ghost-button" onClick={actions.resetBoard}>
              Reset sample board
            </button>
          </div>
        </header>

        <div className="board-scroll">
          <div className="board-surface" style={{ minWidth: `${boardWidth + CARD_WIDTH + COLUMN_GAP}px` }}>
            <GoalsLane
              goals={storyMap.goals}
              selection={selection}
              gridTemplateColumns={headerGridColumns}
              onCreate={actions.openGoalCreate}
              onEdit={actions.openGoalEdit}
              onDelete={actions.deleteGoal}
              onStartDrag={actions.startDrag}
              onEndDrag={actions.endDrag}
              onDropGoal={actions.dropGoal}
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

            {storyMap.releases.map((release) => (
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
