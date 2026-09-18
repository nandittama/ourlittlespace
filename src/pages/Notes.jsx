import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import { getOtherPerson } from '../config'
import NoteCard from '../components/NoteCard'
import PersonPicker from '../components/PersonPicker'
import ConnectionError from '../components/ConnectionError'
import Loading from '../components/Loading'

export default function Notes() {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const loadNotes = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setFailed(true)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      console.error(err)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const createNote = async (e) => {
    e.preventDefault()
    if (!hasPerson) {
      showToast('Choose who you are first.', 'error')
      return
    }

    const text = content.trim()
    if (!text) {
      showToast('Write something first.', 'error')
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.from('notes').insert({
        person,
        content: text,
      })
      if (error) throw error
      setContent('')
      showToast('Saved.', 'success')
      await loadNotes()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const deleteNote = async (id) => {
    setBusy(true)
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      showToast('Deleted.', 'success')
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const fromYou = hasPerson ? notes.filter((n) => n.person === person) : notes.filter((n) => n.person === 'kamu')
  const fromPartner = hasPerson
    ? notes.filter((n) => n.person === getOtherPerson(person))
    : notes.filter((n) => n.person === 'dia')

  if (!isSupabaseConfigured || failed) return <ConnectionError />
  if (loading) return <Loading />

  return (
    <div className="page fade-in">
      <header className="page-header">
        <h1>Notes</h1>
        <p className="muted">Small notes for each other.</p>
      </header>

      {!hasPerson ? <PersonPicker /> : null}

      <form className="panel form" onSubmit={createNote}>
        <label>
          Write a note
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            rows={3}
            maxLength={500}
            placeholder="Jangan lupa makan."
            disabled={!hasPerson}
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
          {busy ? 'Saving...' : 'Save note'}
        </button>
      </form>

      <div className="notes-columns">
        <section>
          <h2>From You</h2>
          {fromYou.length === 0 ? (
            <p className="empty-state">No notes yet.</p>
          ) : (
            fromYou.map((note) => (
              <NoteCard key={note.id} note={note} busy={busy} onDelete={deleteNote} />
            ))
          )}
        </section>

        <section>
          <h2>From Partner</h2>
          {fromPartner.length === 0 ? (
            <p className="empty-state">No notes yet.</p>
          ) : (
            fromPartner.map((note) => (
              <NoteCard key={note.id} note={note} busy={busy} onDelete={deleteNote} />
            ))
          )}
        </section>
      </div>
    </div>
  )
}
