import { useMemo, useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { formatNoteWhen } from '../../utils/date'
import { getOtherPerson, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

const REACTIONS = [
  { type: 'heart', emoji: '❤️' },
  { type: 'love', emoji: '🥰' },
  { type: 'sparkle', emoji: '✨' },
]

export default function NotesSection({ notes, reactions, onChanged }) {
  const { person, hasPerson, partnerName } = usePerson()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const reactionMap = useMemo(() => {
    const map = {}
    for (const r of reactions || []) {
      if (!map[r.note_id]) map[r.note_id] = []
      map[r.note_id].push(r)
    }
    return map
  }, [reactions])

  const create = async (e) => {
    e.preventDefault()
    if (!hasPerson || busy) return
    const text = content.trim()
    if (!text) {
      showToast('Tulis sesuatu dulu ya.', 'error')
      return
    }
    if (text.length > 500) {
      showToast('Maksimal 500 karakter.', 'error')
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
      showToast('Catatan terkirim.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
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
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
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
      showToast('Dihapus.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section id="notes" title="Love Notes" subtitle="Kata-kata kecil yang bisa dikenang.">
      <p className="progress-badge">{notes.length} tersimpan</p>

      <form className="card form-card note-composer" onSubmit={create}>
        <label className="field" htmlFor="note-composer">
          <span>Write something for {partnerName || 'them'}...</span>
          <textarea
            id="note-composer"
            rows={3}
            maxLength={500}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Semoga hari kamu hari ini lebih baik dari kemarin."
            disabled={!hasPerson || busy}
          />
        </label>
        <div className="emoji-row">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              type="button"
              className="emoji-chip"
              disabled={!hasPerson || busy}
              onClick={() => setContent((c) => `${c}${r.emoji}`)}
              aria-label={`Tambah ${r.emoji}`}
            >
              {r.emoji}
            </button>
          ))}
        </div>
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
          {busy ? 'Mengirim...' : 'Leave Note'}
        </button>
      </form>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="empty">Belum ada little notes. Mungkin kamu bisa tinggalkan yang pertama? 💌</p>
        ) : (
          notes.slice(0, 10).map((note) => {
            const list = reactionMap[note.id] || []
            return (
              <article key={note.id} className="love-note">
                <p className="love-note__meta">💌 From {getPersonName(note.sender)}</p>
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
                          aria-label={`Reaksi ${r.emoji}`}
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
                        Hapus
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus catatan ini?"
        message="Tidak bisa dibatalkan."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Section>
  )
}
