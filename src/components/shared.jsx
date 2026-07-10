export function CardButton({
  children,
  className,
  dataColor,
  dataPriority,
  onClick,
  onDelete,
  footer,
  style,
  ...dragProps
}) {
  return (
    <button
      type="button"
      className={`card ${className}`.trim()}
      data-color={dataColor}
      data-priority={dataPriority}
      onClick={onClick}
      style={style}
      {...dragProps}
    >
      {onDelete ? (
        <span
          className="card-delete"
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
        >
          ×
        </span>
      ) : null}
      <span>{children}</span>
      {footer}
    </button>
  )
}

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

export function StorySpacer() {
  return <div className="story-cell story-spacer" aria-hidden="true" />
}
