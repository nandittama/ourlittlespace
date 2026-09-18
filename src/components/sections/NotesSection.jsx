import { useMemo, useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { formatNoteWhen } from '../../utils/date'
import { getOtherPerson, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

const EMOJIS = ['💌', '🌻', '☕', '✨']
const REACTIONS = [
  { type: 'heart', emoji: '❤️' },
  { type: 'love', emoji: '🥰' },
  { type: 'sparkle', emoji: '✨' },
]

export default function NotesSection({ notes, reactions, letters, onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [letterOpen, setLetterOpen] = useState(null)

  const reactionMap = useMemo(() => {
    const map = {}
    for (const r of reactions || []) {
      if (!map[r.note_id]) map[r.note_id] = []
      map[r.note_id].push(r)
    }
    return map
  }, [reactions])

  const waitingLetters = (letters || []).length

  const create = async (e) => {
    e.preventDefault()
    if (!hasPerson || busy) return
    const text = content.trim()
    if (!text) {
      showToast('Write something first.', 'error')
      return
    }
    if (text.length > 500) {
      showToast('Notes can be up to 500 characters.', 'error')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.from('notes').insert({
        sender: person,
        receiver: getOtherPerson(person),
        content: text,
        is_read: false,
      })
      if (error) throw error
      setContent('')
      showToast('Note sent.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggleReaction = async (noteId, reactionType) => {
    if (!hasPerson || busy) return
    const existing = (reactionMap[noteId] || []).find(
      (r) => r.person === person && r.reaction_type === reactionType
    )
    setBusy(true)
    try {
      if (existing) {
        const { error } = await supabase.from('note_reactions').delete().eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('note_reactions').insert({
          note_id: noteId,
          person,
          reaction_type: reactionType,
        })
        if (error) throw error
      }
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

  const openLetter = () => {
    const list = letters || []
    if (!list.length) {
      showToast('No letters waiting yet.', 'error')
      return
    }
    const today = new Date().toISOString().slice(0, 10)
    const eligible = list.find((l) => !l.open_on || l.open_on <= today)
    if (!eligible) {
      setLetterOpen({ locked: true })
      return
    }
    setLetterOpen(eligible)
  }

  return (
    <Section id="notes" title="Love Notes" subtitle="Small words, kept softly.">
      <p className="progress-badge">{notes.length} tersimpan</p>

      <form className="card form-card note-composer" onSubmit={create}>
        <label className="field" htmlFor="note-composer">
          <span>Bisikkan sesuatu yang hangat hari ini...</span>
          <textarea
            id="note-composer"
            rows={3}
            maxLength={500}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Semoga hari kamu berjalan baik."
            disabled={!hasPerson || busy}
          />
        </label>
        <div className="emoji-row">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="emoji-chip"
              disabled={!hasPerson || busy}
              onClick={() => setContent((c) => `${c}${emoji}`)}
              aria-label={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
          {busy ? 'Sending...' : 'Kirim Catatan'}
        </button>
      </form>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="empty">Leave the first little note.</p>
        ) : (
          notes.slice(0, 8).map((note) => {
            const list = reactionMap[note.id] || []
            return (
              <article key={note.id} className="love-note">
                <p className="love-note__meta">
                  From {getPersonName(note.sender)} to {getPersonName(note.receiver)}
                </p>
                <p className="love-note__body">“{note.content}”</p>
                <div className="love-note__footer">
                  <span className="muted tiny">{formatNoteWhen(note.created_at)}</span>
                  <div className="reaction-row">
                    {REACTIONS.map((r) => {
                      const count = list.filter((x) => x.reaction_type === r.type).length
                      const mine = list.some(
                        (x) => x.person === person && x.reaction_type === r.type
                      )
                      return (
                        <button
                          key={r.type}
                          type="button"
                          className={`reaction-btn ${mine ? 'is-on' : ''}`}
                          disabled={busy || !hasPerson}
                          onClick={() => toggleReaction(note.id, r.type)}
                          aria-pressed={mine}
                          aria-label={`${r.emoji} reaction`}
                        >
                          {r.emoji}
                          {count > 0 ? <span>{count}</span> : null}
                        </button>
                      )
                    })}
                    {hasPerson && note.sender === person ? (
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
                </div>
              </article>
            )
          })
        )}
      </div>

      <div className="mailbox-card">
        <div>
          <p className="mailbox-card__title">Secret Mailbox</p>
          <p className="muted tiny">
            {waitingLetters > 0
              ? `${waitingLetters} letters waiting.`
              : 'A quiet place for later.'}
          </p>
        </div>
        <button type="button" className="btn btn--secondary btn--sm" onClick={openLetter}>
          Open a letter
        </button>
      </div>

      {letterOpen ? (
        <div className="confirm-modal" role="dialog" aria-modal="true">
          <div className="confirm-modal__card">
            {letterOpen.locked ? (
              <>
                <h2>Not yet</h2>
                <p className="muted">This letter is waiting for you.</p>
              </>
            ) : (
              <>
                <h2>A letter for you</h2>
                <p className="love-note__body">“{letterOpen.content}”</p>
                <p className="muted tiny">From {getPersonName(letterOpen.sender)}</p>
              </>
            )}
            <button type="button" className="btn btn--primary" onClick={() => setLetterOpen(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}

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
