import { formatRelativeTime } from '../utils/date'
import { getPersonName } from '../config'

export default function NoteCard({ note, onDelete, busy }) {
  return (
    <article className="note-card fade-in">
      <p className="note-card__content">{note.content}</p>
      <div className="note-card__meta">
        <span>{getPersonName(note.person)}</span>
        <span>·</span>
        <span>{formatRelativeTime(note.created_at)}</span>
      </div>
      <div className="note-card__actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={busy}
          onClick={() => onDelete(note.id)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
