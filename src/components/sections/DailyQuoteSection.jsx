import Section from '../Section'
import { DAILY_QUOTES, PERSON_ONE_NAME, PERSON_TWO_NAME } from '../../config'
import { pickDailyQuote } from '../../utils/date'

export default function DailyQuoteSection() {
  const quote = pickDailyQuote(DAILY_QUOTES)

  return (
    <Section id="quote" title="A little note for today" subtitle="Soft words, once a day.">
      <blockquote className="quote-card">
        <p>“{quote}”</p>
        <footer>
          — For {PERSON_ONE_NAME} &amp; {PERSON_TWO_NAME}
        </footer>
      </blockquote>
    </Section>
  )
}
