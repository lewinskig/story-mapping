import { AddSlot } from '../../../shared/ui/AddSlot'
import { CardButton } from '../../../shared/ui/CardButton'

function getVerticalDropPosition(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

export function StoryCell({ stories, isPlanned, selection, onCreate, onEdit, onDelete, onStartDrag, onEndDrag, onDrop }) {
  return (
    <div
      className="story-cell"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onDrop({ position: 'end' })
      }}
    >
      {stories.map((story) => (
        <CardButton
          key={story.id}
          className={'story-card ' + (selection?.id === story.id ? 'is-active' : '')}
          dataPriority={story.priority}
          onClick={() => onEdit(story)}
          onDelete={() => onDelete(story.id)}
          draggable
          onDragStart={(event) => onStartDrag('story', story.id, event)}
          onDragEnd={onEndDrag}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onDrop({ storyId: story.id, position: getVerticalDropPosition(event) })
          }}
          footer={<span className="story-meta">{story.priority}</span>}
        >
          <span className="story-title">{story.name}</span>
        </CardButton>
      ))}
      <AddSlot label={isPlanned ? 'Add planned story' : 'Add story'} onClick={onCreate} compact />
    </div>
  )
}
