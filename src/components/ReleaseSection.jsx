import { StorySpacer } from './StorySpacer'
import { StoryCell } from './StoryCell'

export function ReleaseSection({ release, columns, selection, storyGridColumns, onEdit, onDelete, onStoryCreate, onStoryEdit, onStoryDelete, onStartDrag, onEndDrag, onDropStory }) {
  return (
    <section className="release-band">
      <div className="release-line-wrap">
        <button
          type="button"
          className={`release-label ${selection?.id === release.id ? 'is-active' : ''}`}
          onClick={() => onEdit(release)}
        >
          {release.name}
          {release.dueDate ? <span className="release-meta">{release.dueDate}</span> : null}
        </button>
        {!release.system ? (
          <button type="button" className="card-delete release-delete" onClick={() => onDelete(release.id)} aria-label={`Delete ${release.name}`}>
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
              isPlanned={release.system}
              selection={selection}
              onCreate={() => onStoryCreate(release.id, column.step.id)}
              onEdit={onStoryEdit}
              onDelete={onStoryDelete}
              onStartDrag={onStartDrag}
              onEndDrag={onEndDrag}
              onDrop={(beforeStoryId) => onDropStory({ stepId: column.step.id, releaseId: release.id, beforeStoryId })}
            />
          ) : (
            <StorySpacer key={`${release.id}-${column.id}`} />
          ),
        )}
      </div>
    </section>
  )
}
