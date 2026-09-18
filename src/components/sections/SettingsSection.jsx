import { useState } from 'react'
import Section from '../Section'
import {
  DEFAULT_PERSON_ONE_NAME,
  DEFAULT_PERSON_TWO_NAME,
  STORAGE_KEY_NAME_ONE,
  STORAGE_KEY_NAME_TWO,
  readStoredName,
} from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'

export default function SettingsSection() {
  const { person, hasPerson, setPerson, persons, switchPerson, clearPerson, updateNames } =
    usePerson()
  const { showToast } = useToast()
  const [nameOne, setNameOne] = useState(() =>
    readStoredName(STORAGE_KEY_NAME_ONE, DEFAULT_PERSON_ONE_NAME)
  )
  const [nameTwo, setNameTwo] = useState(() =>
    readStoredName(STORAGE_KEY_NAME_TWO, DEFAULT_PERSON_TWO_NAME)
  )

  const saveNames = (e) => {
    e.preventDefault()
    updateNames(nameOne, nameTwo)
    showToast('Names saved on this device.', 'success')
  }

  return (
    <Section id="settings" title="Little settings" subtitle="Just enough.">
      <div className="card settings-card">
        <p className="card-label">Who&apos;s using this device</p>
        <div className="person-pick">
          {persons.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`person-pick__btn ${person === p.key ? 'is-active' : ''}`}
              onClick={() => {
                setPerson(p.key)
                showToast(`Hi, ${p.name}.`, 'success')
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {hasPerson ? (
          <div className="settings-actions">
            <button type="button" className="btn btn--secondary" onClick={switchPerson}>
              Switch person
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                clearPerson()
                showToast('Identity cleared.', 'success')
              }}
            >
              Clear local identity
            </button>
          </div>
        ) : null}

        <form className="name-hints" onSubmit={saveNames}>
          <label className="field">
            <span>Name for Kamu</span>
            <input value={nameOne} onChange={(e) => setNameOne(e.target.value)} maxLength={40} />
          </label>
          <label className="field">
            <span>Name for Dia</span>
            <input value={nameTwo} onChange={(e) => setNameTwo(e.target.value)} maxLength={40} />
          </label>
          <button type="submit" className="btn btn--primary">
            Save names
          </button>
        </form>
      </div>
    </Section>
  )
}
