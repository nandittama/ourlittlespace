import Section from '../Section'
import { COUNTDOWNS, ANNIVERSARY_DATE } from '../../config'
import { daysUntil, formatShortDate, nextAnniversaryDate } from '../../utils/date'

export default function CountdownSection() {
  const items = COUNTDOWNS.map((item) => {
    let target = item.targetDate
    if (item.kind === 'anniversary') {
      target = nextAnniversaryDate(ANNIVERSARY_DATE) || item.targetDate
    }
    const daysLeft = daysUntil(target)
    return { ...item, targetDate: target, daysLeft }
  }).filter((item) => item.daysLeft >= 0)

  return (
    <Section
      id="countdown"
      title="Countdown"
      subtitle="Hari-hari yang kita tunggu."
      className="section--secondary"
    >
      {items.length === 0 ? (
        <p className="empty">Belum ada yang dijadwalkan.</p>
      ) : (
        <div className="countdown-grid">
          {items.map((item) => (
            <article key={item.id} className="countdown-card">
              <p className="countdown-card__label">
                {item.emoji ? `${item.emoji} ` : ''}
                {item.label}
              </p>
              <p className="countdown-card__days">{item.daysLeft}</p>
              <p className="countdown-card__unit">days to go</p>
              <h3>{item.title}</h3>
              <p className="muted tiny">{formatShortDate(item.targetDate)}</p>
            </article>
          ))}
        </div>
      )}
    </Section>
  )
}
