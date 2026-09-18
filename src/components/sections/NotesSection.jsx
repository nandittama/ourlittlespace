import { useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { formatNoteDay } from '../../utils/date'
import { getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function NotesSection({ notes, onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const create = async (e) => {
    e.preventDefault()
    if (!hasPerson || busy) return
    const text = content.trim()
    if (!text) {
      showToast('Write something first.', 'error')
      return
    }
    if (text.length > 300) {
      showToast('Notes can be up to 300 characters.', 'error')
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.from('notes').insert({ person, content: text })
      if (error) throw error
      setContent('')
      showToast('Note saved.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return
    setBusy(true)
    try {
      const { error } = await supabase.from('notes').delete().eq('id', pendingDelete)
      if (error) throw error
      setPendingDelete(null)
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
          <span>Write something</span>
          <textarea
            rows={3}
            maxLength={300}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Don't forget to eat today."
            disabled={!hasPerson || busy}
          />
          <span className="field-hint">{content.trim().length}/300</span>
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
          {busy ? 'Saving...' : 'Leave a note'}
        </button>
      </form>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="empty">No little notes yet.</p>
        ) : (
          notes.slice(0, 8).map((note) => (
            <article key={note.id} className="note-item">
              <p className="note-item__text">“{note.content}”</p>
              <div className="note-item__meta">
                <span>
                  — {getPersonName(note.person)}
                  <span className="dot">·</span>
                  {formatNoteDay(note.created_at)}
                </span>
                {hasPerson && note.person === person ? (
                  <button
                    type="button"
                    className="linkish"
                    disabled={busy}
                    onClick={() => setPendingDelete(note.id)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this note?"
        message="This can't be undone."
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Section>
  )
}
