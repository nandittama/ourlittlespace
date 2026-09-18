import Section from '../Section'
import { DAILY_QUOTES } from '../../config'
import { pickDailyQuote } from '../../utils/date'

export default function DailyQuoteSection() {
  const { text, author } = pickDailyQuote(DAILY_QUOTES)

  return (
    <Section
      id="quote"
      title="Daily Little Thing 🤍"
      subtitle="Kata untuk hari ini."
      className="section--secondary"
    >
      <blockquote className="quote-card">
        <p>“{text}”</p>
        {author ? <footer>— {author}</footer> : null}
      </blockquote>
    </Section>
  )
}
