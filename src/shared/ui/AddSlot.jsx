export function AddSlot({ label, onClick, compact = false, stretch = false, onDragOver, onDrop }) {
  return (
    <button
      type="button"
      className={`add-slot ${compact ? 'is-compact' : ''} ${stretch ? 'is-stretch' : ''}`.trim()}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <span className="add-slot-plus">+</span>
      <span className="add-slot-label">{label}</span>
    </button>
  )
}
