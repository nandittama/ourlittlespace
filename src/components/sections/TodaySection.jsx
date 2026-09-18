import Section from '../Section'
import { PERSON_ONE, PERSON_TWO, getPersonName } from '../../config'
import { formatTodayShort, isJakartaToday } from '../../utils/date'

export default function TodaySection({ moodOne, moodTwo, notes }) {
  const todayNotes = (notes || []).filter((n) => isJakartaToday(n.created_at))
  const hasAnything = Boolean(moodOne || moodTwo || todayNotes.length)

  return (
    <Section id="today" title="Today With Us" subtitle="Sedikit kabar dari hari ini.">
      <div className="today-card">
        <p className="today-date">Today, {formatTodayShort()}</p>

        {!hasAnything ? (
          <p className="today-empty-line">Nothing new today, just us 🤍</p>
        ) : (
          <div className="today-lines">
            <div className="today-person-row">
              <span>{getPersonName(PERSON_ONE)}</span>
              <strong>
                {moodOne ? `${moodOne.mood_emoji} ${moodOne.mood_label}` : '—'}
              </strong>
            </div>
            <div className="today-person-row">
              <span>{getPersonName(PERSON_TWO)}</span>
              <strong>
                {moodTwo ? `${moodTwo.mood_emoji} ${moodTwo.mood_label}` : '—'}
              </strong>
            </div>
            <p className="today-chip">
              💌{' '}
              {todayNotes.length > 0
                ? `${todayNotes.length} note hari ini`
                : 'Belum ada note hari ini'}
            </p>
          </div>
        )}
      </div>
    </Section>
  )
}
