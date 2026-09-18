export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm-modal__card">
        <h2 id="confirm-title">{title}</h2>
        {message ? <p className="muted">{message}</p> : null}
        <div className="confirm-modal__actions">
          <button type="button" className="btn btn--ghost" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn--danger" disabled={busy} onClick={onConfirm}>
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
