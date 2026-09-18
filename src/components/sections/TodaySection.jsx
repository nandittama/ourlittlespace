import Section from '../Section'
import { PERSON_ONE, PERSON_TWO, getPersonName } from '../../config'
import { daysUntil, formatShortDate } from '../../utils/date'
import { COUNTDOWNS } from '../../config'

export default function TodaySection({ moodOne, moodTwo, latestNote, nextCountdown }) {
  const countdown =
    nextCountdown ||
    COUNTDOWNS.map((c) => ({ ...c, daysLeft: daysUntil(c.targetDate) }))
      .filter((c) => c.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)[0]

  return (
    <Section id="today" title="Today" subtitle="A quiet snapshot of us.">
      <div className="today-grid">
        <article className="today-tile">
          <p className="today-label">{getPersonName(PERSON_ONE)}&apos;s mood</p>
          <p className="today-value">
            {moodOne ? `${moodOne.mood_emoji} ${moodOne.mood_label}` : 'How are you feeling today?'}
          </p>
        </article>
        <article className="today-tile">
          <p className="today-label">{getPersonName(PERSON_TWO)}&apos;s mood</p>
          <p className="today-value">
            {moodTwo ? `${moodTwo.mood_emoji} ${moodTwo.mood_label}` : 'Waiting for a check-in.'}
          </p>
        </article>
        <article className="today-tile today-tile--wide">
          <p className="today-label">Today&apos;s latest note</p>
          <p className="today-value today-value--serif">
            {latestNote ? `“${latestNote.content}”` : 'Leave the first little note.'}
          </p>
        </article>
        <article className="today-tile today-tile--wide">
          <p className="today-label">Upcoming</p>
          <p className="today-value">
            {countdown
              ? `${countdown.daysLeft} days · ${countdown.title}`
              : 'Nothing planned yet.'}
          </p>
          {countdown ? (
            <p className="muted tiny">{formatShortDate(countdown.targetDate)}</p>
          ) : null}
        </article>
      </div>
    </Section>
  )
}
