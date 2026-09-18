import { useState } from 'react'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

function scrollTo(id, focusSelector) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (focusSelector) {
    window.setTimeout(() => {
      document.querySelector(focusSelector)?.focus?.()
    }, 450)
  }
}

export default function QuickActionsSection({ onOpenMemory }) {
  const { person, hasPerson } = usePerson()
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
    showToast('Sent a little hug. 🫂', 'success')
    window.setTimeout(() => setHugPulse(false), 700)
    setBusy(false)
  }

  return (
    <section id="actions" className="quick-actions" aria-label="Quick actions">
      <button type="button" className={`qa-btn ${hugPulse ? 'is-pulse' : ''}`} onClick={sendHug}>
        <span aria-hidden="true">🫂</span>
        Send a Hug
      </button>
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
          scrollTo('music')
          window.setTimeout(() => document.getElementById('music-play')?.click(), 400)
        }}
      >
        <span aria-hidden="true">🎵</span>
        Play Our Song
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
        Add a Memory
      </button>
    </section>
  )
}
