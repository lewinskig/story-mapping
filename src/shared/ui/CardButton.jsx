export function CardButton({ children, className, dataColor, dataPriority, onClick, onDelete, footer, style, ...dragProps }) {
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
