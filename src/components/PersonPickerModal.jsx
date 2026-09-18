import { PERSONS } from '../config'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'

/** Only used when no persona is chosen yet — compact gate, not a full settings page. */
export default function PersonPickerModal() {
  const { person, setPerson, pickerOpen, closePicker, hasPerson } = usePerson()
  const { showToast } = useToast()

  if (!pickerOpen || hasPerson) return null

  return (
    <div className="person-modal" role="dialog" aria-modal="true" aria-labelledby="person-modal-title">
      <div className="person-modal__card">
        <h2 id="person-modal-title">Who&apos;s here?</h2>
        <p className="muted">Nadhif or Diah — just for this device.</p>
        <div className="person-pick">
          {PERSONS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`person-pick__btn ${person === p.key ? 'is-active' : ''}`}
              onClick={() => {
                setPerson(p.key)
                closePicker()
                showToast(`Hi, ${p.name}.`, 'success')
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
