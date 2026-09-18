import Section from '../Section'
import { PERSONS } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'

export default function SettingsSection() {
  const { person, setPerson } = usePerson()
  const { showToast } = useToast()

  return (
    <Section id="settings" title="Little settings" subtitle="Who's using this device?">
      <div className="card settings-card">
        <div className="person-pick">
          {PERSONS.map((p) => (
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
      </div>
    </Section>
  )
}
