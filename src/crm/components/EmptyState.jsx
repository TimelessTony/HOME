export default function EmptyState({ title, hint, actionLabel, onAction }) {
  return (
    <div className="crm-empty">
      <div className="crm-empty__title">{title}</div>
      {hint && <div className="crm-empty__hint">{hint}</div>}
      {actionLabel && (
        <button type="button" className="crm-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
