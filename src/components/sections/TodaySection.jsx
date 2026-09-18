import Section from '../Section'
import { getOtherPerson, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'

export default function TodaySection({ myMood, partnerMood, latestNote, activeTodo }) {
  const { person, hasPerson } = usePerson()
  const partner = hasPerson ? getOtherPerson(person) : 'dia'
  const partnerName = getPersonName(partner)
  const empty = !myMood && !partnerMood && !latestNote && !activeTodo

  return (
    <Section id="today" title="Today" subtitle="A small snapshot of our day.">
      <div className="today-card">
        {empty ? (
          <div className="today-empty">
            <p>Nothing here yet.</p>
            <div className="today-ctas">
              <a className="btn btn--secondary" href="#mood">
                Check in
              </a>
              <a className="btn btn--ghost" href="#notes">
                Leave a note
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="today-row">
              <p className="today-label">Today&apos;s Mood</p>
              <p>
                You: <strong>{myMood?.mood_label || '—'}</strong>
                <span className="dot">·</span>
                {partnerName}: <strong>{partnerMood?.mood_label || '—'}</strong>
              </p>
            </div>
            <div className="today-row">
              <p className="today-label">Today&apos;s Note</p>
              <p>
                {latestNote ? (
                  <>“{latestNote.content}”</>
                ) : (
                  <>
                    Nothing here yet. <a href="#notes">Write one</a>
                  </>
                )}
              </p>
            </div>
            <div className="today-row">
              <p className="today-label">Today&apos;s Plan</p>
              <p>
                {activeTodo ? (
                  activeTodo.title
                ) : (
                  <>
                    Nothing planned. <a href="#todos">Add something</a>
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </Section>
  )
}
