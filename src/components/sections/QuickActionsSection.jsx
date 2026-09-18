import { useState } from 'react'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { getPersonName, getOtherPerson } from '../../config'

function scrollTo(id, focusSelector) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (focusSelector) {
    window.setTimeout(() => document.querySelector(focusSelector)?.focus?.(), 450)
  }
}

export default function QuickActionsSection({ onOpenMemory, onToggleMusic }) {
  const { person, hasPerson, partnerName } = usePerson()
  const { showToast } = useToast()
  const [hugPulse, setHugPulse] = useState(false)
  const [busy, setBusy] = useState(false)

  const sendHug = async () => {
    if (!hasPerson || busy) return
    setBusy(true)
    setHugPulse(true)
    try {
      await supabase.from('hugs').insert({ sender: person })
    } catch (err) {
      console.error(err)
    }
    const to = partnerName || getPersonName(getOtherPerson(person))
    showToast(`A warm hug has been sent to ${to} 🤍`, 'success')
    window.setTimeout(() => setHugPulse(false), 700)
    setBusy(false)
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
        className="qa-btn qa-btn--accent"
        onClick={() => {
          scrollTo('memories')
          onOpenMemory?.()
        }}
      >
        <span aria-hidden="true">📸</span>
        Add Memory
      </button>
      <button
        type="button"
        className="qa-btn"
        onClick={() => {
          scrollTo('music')
          onToggleMusic?.()
        }}
      >
        <span aria-hidden="true">🎵</span>
        Play Our Song
      </button>
      <button
        type="button"
        className={`qa-btn ${hugPulse ? 'is-pulse' : ''}`}
        onClick={sendHug}
        disabled={busy}
      >
        <span aria-hidden="true">🤗</span>
        Send a Hug
      </button>
    </section>
  )
}
