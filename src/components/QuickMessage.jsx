import { useState } from 'react'
import { QUICK_MESSAGE_OPTIONS } from '../utils/quickMessages'
import { supabase } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'

export default function QuickMessage({ onSent, partnerName = 'them' }) {
  const { person } = usePerson()
  const { showToast } = useToast()
  const [sending, setSending] = useState(null)
  const [custom, setCustom] = useState('')

  const send = async (payload) => {
    setSending(payload.type)
    try {
      const { error } = await supabase.from('quick_messages').insert({
        person,
        type: payload.type,
        message: payload.message,
      })
      if (error) throw error
      showToast('Sent.', 'success')
      setCustom('')
      onSent?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSending(null)
    }
  }

  const sendCustom = (e) => {
    e.preventDefault()
    const text = custom.trim()
    if (!text) {
      showToast('Write something first.', 'error')
      return
    }
    send({ type: 'custom', message: text.slice(0, 100) })
  }

  return (
    <section className="panel say-something fade-in">
      <h2>Say Something</h2>
      <p className="muted">Instant reactions for {partnerName}.</p>

      <div className="say-something__row">
        {QUICK_MESSAGE_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            className="say-chip"
            disabled={sending === option.type}
            onClick={() => send({ type: option.type, message: `${option.emoji} ${option.message}` })}
          >
            <span aria-hidden="true">{option.emoji}</span>
            {sending === option.type ? '...' : option.message}
          </button>
        ))}
      </div>

      <form className="say-input" onSubmit={sendCustom}>
        <input
          type="text"
          value={custom}
          maxLength={100}
          placeholder={`Write your own whisper for ${partnerName}...`}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="submit" className="say-input__send" disabled={Boolean(sending)} aria-label="Send">
          ➤
        </button>
      </form>
    </section>
  )
}
