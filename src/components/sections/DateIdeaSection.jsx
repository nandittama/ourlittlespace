import { useState } from 'react'
import Section from '../Section'
import { pickRandomIdea } from '../../utils/dateIdeas'

export default function DateIdeaSection() {
  const [idea, setIdea] = useState(null)
  const [pulse, setPulse] = useState(false)

  const roll = () => {
    setIdea((prev) => pickRandomIdea(prev))
    setPulse(true)
    window.setTimeout(() => setPulse(false), 420)
  }

  return (
    <Section id="date" title="What should we do?" subtitle="Let us pick something.">
      <div className={`date-card ${pulse ? 'is-pulse' : ''}`}>
        <p className="date-card__result">{idea || 'Tap for a simple idea.'}</p>
        <button type="button" className="btn btn--primary" onClick={roll}>
          Give us an idea
        </button>
      </div>
    </Section>
  )
}
