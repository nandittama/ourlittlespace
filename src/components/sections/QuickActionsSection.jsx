import { usePerson } from '../../context/PersonContext'
import { getWhatsAppUrl } from '../../config'

function scrollTo(id, focusSelector) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (focusSelector) {
    window.setTimeout(() => document.querySelector(focusSelector)?.focus?.(), 450)
  }
}

export default function QuickActionsSection({ onOpenMemory }) {
  const { partnerName } = usePerson()

  const callPartner = () => {
    window.open(getWhatsAppUrl(), '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="actions" className="quick-actions" aria-label="Quick actions">
      <button
        type="button"
        className="qa-btn"
        onClick={() => scrollTo('notes', '#note-composer')}
      >
        <span aria-hidden="true">💌</span>
        Leave a Note
      </button>
      <button
        type="button"
        className="qa-btn"
        onClick={() => {
          scrollTo('memories')
          onOpenMemory?.()
        }}
      >
        <span aria-hidden="true">📸</span>
        Add Memory
      </button>
      <button type="button" className="qa-btn" onClick={() => scrollTo('music')}>
        <span aria-hidden="true">🎵</span>
        Play Our Song
      </button>
      <button type="button" className="qa-btn" onClick={callPartner}>
        <span aria-hidden="true">📞</span>
        Call {partnerName || 'Partner'}
      </button>
    </section>
  )
}
