import Section from '../Section'
import { getOtherPerson, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'

export default function TodaySection({ myMood, partnerMood, latestNote, activeTodo }) {
  const { person, hasPerson } = usePerson()
  const partner = hasPerson ? getOtherPerson(person) : 'dia'

  return (
    <Section id="today" title="Today" subtitle="A small snapshot of our day.">
      <div className="today-card">
        <div className="today-row">
          <p className="today-label">Today&apos;s Mood</p>
          <p>
            You: <strong>{myMood?.mood_label || '—'}</strong>
            <span className="dot">·</span>
            {getPersonName(partner)}: <strong>{partnerMood?.mood_label || '—'}</strong>
          </p>
        </div>
        <div className="today-row">
          <p className="today-label">Today&apos;s Little Note</p>
          <p>{latestNote ? `“${latestNote.content}”` : 'Belum ada little note.'}</p>
        </div>
        <div className="today-row">
          <p className="today-label">Today&apos;s Plan</p>
          <p>{activeTodo ? activeTodo.title : 'Belum ada rencana.'}</p>
        </div>
      </div>
    </Section>
  )
}
