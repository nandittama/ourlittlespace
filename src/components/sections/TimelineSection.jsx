import Section from '../Section'
import { TIMELINE_EVENTS } from '../../config'
import { formatShortDate } from '../../utils/date'

export default function TimelineSection() {
  const events = [...TIMELINE_EVENTS].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <Section id="story" title="Our Story" subtitle="Perjalanan kecil kita." className="section--secondary">
      <ol className="timeline">
        {events.map((event) => (
          <li key={event.id} className="timeline__item">
            <p className="timeline__date">{formatShortDate(event.date)}</p>
            <h3 className="timeline__title">{event.title}</h3>
            <p className="timeline__desc">“{event.description}”</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
