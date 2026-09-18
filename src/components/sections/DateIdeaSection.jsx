import { useState } from 'react'
import Section from '../Section'
import { pickRandomIdea } from '../../utils/dateIdeas'

export default function DateIdeaSection() {
  const [idea, setIdea] = useState(null)

  return (
    <Section id="date" title="Need an idea?" subtitle="A tiny spark for today.">
      <div className="date-card">
        <p className="date-card__result">{idea || 'Tap the button for something simple.'}</p>
        <button type="button" className="btn btn--primary" onClick={() => setIdea(pickRandomIdea(idea))}>
          Give us an idea
        </button>
      </div>
    </Section>
  )
}
