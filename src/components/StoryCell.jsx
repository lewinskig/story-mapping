import { AddSlot } from './AddSlot'
import { CardButton } from './CardButton'

export function StoryCell({ stories, isPlanned, selection, onCreate, onEdit, onDelete, onStartDrag, onEndDrag, onDrop }) {
  return (
    <div
      className="story-cell"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onDrop(null)
      }}
    >
      {stories.map((story) => (
        <CardButton
          key={story.id}
          className={`story-card ${selection?.id === story.id ? 'is-active' : ''}`}
          dataPriority={story.priority}
          onClick={() => onEdit(story)}
          onDelete={() => onDelete(story.id)}
          draggable
          onDragStart={() => onStartDrag('story', story.id)}
          onDragEnd={onEndDrag}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            onDrop(story.id)
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
