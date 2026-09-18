import { useState } from 'react'
import { QUICK_MESSAGE_OPTIONS } from '../utils/quickMessages'
import { supabase } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import PersonPicker from './PersonPicker'

export default function QuickMessage({ onSent }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [sending, setSending] = useState(null)
  const [needPick, setNeedPick] = useState(false)

  const send = async (option) => {
    if (!hasPerson) {
      setNeedPick(true)
      return
    }

    setSending(option.type)
    try {
      const { error } = await supabase.from('quick_messages').insert({
        person,
        type: option.type,
        message: `${option.emoji} ${option.message}`,
      })
      if (error) throw error
      showToast('Sent.', 'success')
      onSent?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSending(null)
    }
  }

  return (
    <section className="quick-message fade-in">
      <h2>Say something</h2>
      <p className="muted">A small note for the space.</p>
      {needPick && !hasPerson ? <PersonPicker compact /> : null}
      <div className="quick-message__grid">
        {QUICK_MESSAGE_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            className="quick-message__btn"
            disabled={sending === option.type}
            onClick={() => send(option)}
          >
            <span aria-hidden="true">{option.emoji}</span>
            <span>{sending === option.type ? 'Sending...' : option.message}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
