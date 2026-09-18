import { useState } from 'react'
import Section from '../Section'
import { formatRelativeTime } from '../../utils/date'
import { getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function NotesSection({ notes, onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)

  const create = async (e) => {
    e.preventDefault()
    if (!hasPerson) {
      showToast('Pilih identitas dulu di atas.', 'error')
      return
    }
    const text = content.trim()
    if (!text) {
      showToast('Tulis catatan dulu.', 'error')
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.from('notes').insert({ person, content: text })
      if (error) throw error
      setContent('')
      showToast('Saved.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    setBusy(true)
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      showToast('Deleted.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section id="notes" title="Little Notes" subtitle="Small words for each other.">
      <form className="card form-card" onSubmit={create}>
        <label className="field">
          <span>Write a note</span>
          <textarea
            rows={3}
            maxLength={500}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Jangan lupa makan."
            disabled={!hasPerson}
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
          {busy ? 'Saving...' : 'Leave a note'}
        </button>
      </form>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="empty">Belum ada little note.</p>
        ) : (
          notes.slice(0, 8).map((note) => (
            <article key={note.id} className="note-item">
              <p>{note.content}</p>
              <div className="note-item__meta">
                <span>
                  {getPersonName(note.person)} · {formatRelativeTime(note.created_at)}
                </span>
                {hasPerson && note.person === person ? (
                  <button type="button" className="linkish" disabled={busy} onClick={() => remove(note.id)}>
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </Section>
  )
}
