import { PERSONS } from '../config'
import { usePerson } from '../context/PersonContext'

export default function PersonPicker({ compact = false }) {
  const { setPerson } = usePerson()

  return (
    <div className={`person-picker ${compact ? 'person-picker--compact' : ''} fade-in`}>
      {!compact && (
        <>
          <h2>Who are you?</h2>
          <p className="muted">Choose once — you can switch later.</p>
        </>
      )}
      {compact && <p className="person-picker__label">Choose who you are</p>}
      <div className="person-picker__grid">
        {PERSONS.map((p) => (
          <button
            key={p.key}
            type="button"
            className="person-picker__btn"
            onClick={() => setPerson(p.key)}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
