import { formatShortDate } from '../utils/date'
import { getPersonName } from '../config'

export default function MemoryCard({ memory, imageSrc, onOpen, onDelete, busy }) {
  return (
    <article className="memory-card fade-in">
      <button type="button" className="memory-card__media" onClick={() => onOpen(memory)}>
        {imageSrc ? (
          <img src={imageSrc} alt={memory.title} loading="lazy" />
        ) : (
          <div className="memory-card__placeholder">No photo</div>
        )}
      </button>
      <div className="memory-card__body">
        <h3>{memory.title}</h3>
        <p className="muted">
          {formatShortDate(memory.memory_date)} · {getPersonName(memory.person)}
        </p>
        {memory.description ? <p className="memory-card__desc">{memory.description}</p> : null}
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={busy}
          onClick={() => onDelete(memory)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
