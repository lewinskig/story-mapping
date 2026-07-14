export function EditableBoardTitle({ value, onChange, disabled }) {
  return (
    <input
      type="text"
      className="board-title-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Untitled board"
      aria-label="Board title"
      disabled={disabled}
    />
  )
}
