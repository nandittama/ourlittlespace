import { PERSONS } from '../config'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'

export default function PersonPickerModal() {
  const { person, setPerson, pickerOpen, closePicker, hasPerson } = usePerson()
  const { showToast } = useToast()

  if (!pickerOpen) return null

  const required = !hasPerson

  const choose = (key, name) => {
    setPerson(key)
    closePicker()
    showToast(`Hi, ${name}.`, 'success')
  }

  return (
    <div
      className="person-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="person-modal-title"
      onClick={() => {
        if (!required) closePicker()
      }}
    >
      <div
        className="person-modal__card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="person-modal-title">Who&apos;s using this?</h2>
        <p className="muted">Pilih Nadhif atau Diah untuk lanjut.</p>
        <div className="person-pick">
          {PERSONS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`person-pick__btn ${person === p.key ? 'is-active' : ''}`}
              onClick={() => choose(p.key, p.name)}
            >
              {p.name}
            </button>
          ))}
        </div>
        {!required ? (
          <button type="button" className="btn btn--ghost person-modal__cancel" onClick={closePicker}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  )
}
