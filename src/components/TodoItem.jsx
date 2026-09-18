import { formatRelativeTime } from '../utils/date'
import { getPersonName } from '../config'

export default function TodoItem({ item, onToggle, onDelete, busy }) {
  return (
    <li className={`todo-item fade-in ${item.is_completed ? 'todo-item--done' : ''}`}>
      <label className="todo-item__check">
        <input
          type="checkbox"
          checked={item.is_completed}
          disabled={busy}
          onChange={() => onToggle(item)}
        />
        <span className="todo-item__title">{item.title}</span>
      </label>
      <div className="todo-item__meta">
        <span>Added by {getPersonName(item.person)}</span>
        <span>·</span>
        <span>{formatRelativeTime(item.created_at)}</span>
        {item.is_completed && item.completed_by ? (
          <>
            <span>·</span>
            <span>Done by {getPersonName(item.completed_by)}</span>
          </>
        ) : null}
      </div>
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        disabled={busy}
        onClick={() => onDelete(item.id)}
        aria-label="Delete item"
      >
        Delete
      </button>
    </li>
  )
}
