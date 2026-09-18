import { useState } from 'react'
import Section from '../Section'
import { QUICK_MESSAGE_OPTIONS } from '../../utils/quickMessages'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function QuickMessagesSection({ onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [sending, setSending] = useState(null)

  const send = async (option) => {
    if (!hasPerson) {
      showToast('Pilih identitas dulu di atas.', 'error')
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
      showToast('Sent ❤️', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSending(null)
    }
  }

  return (
    <Section id="messages" title="Just because" subtitle="A little message, nothing more.">
      <div className="quick-grid">
        {QUICK_MESSAGE_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            className="quick-btn"
            disabled={sending === option.type}
            onClick={() => send(option)}
          >
            <span aria-hidden="true">{option.emoji}</span>
            {sending === option.type ? 'Sending...' : option.message}
          </button>
        ))}
      </div>
    </Section>
  )
}
