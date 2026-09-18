import { useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function TodoSection({ todos, onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const doneCount = todos.filter((t) => t.is_completed).length

  const add = async (e) => {
    e.preventDefault()
    if (!hasPerson || busy) return
    const text = title.trim()
    if (!text) {
      showToast('Add a title first.', 'error')
      return
    }
    if (text.length > 100) {
      showToast('Tasks can be up to 100 characters.', 'error')
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.from('todo_items').insert({ person, title: text })
      if (error) throw error
      setTitle('')
      showToast('Saved.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (item) => {
    if (!hasPerson || busy) return
    const next = !item.is_completed
    setBusy(true)
    try {
      const { error } = await supabase
        .from('todo_items')
        .update({
          is_completed: next,
          completed_by: next ? person : null,
          completed_at: next ? new Date().toISOString() : null,
        })
        .eq('id', item.id)
      if (error) throw error
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
      const { error } = await supabase.from('todo_items').delete().eq('id', pendingDelete)
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
    <Section id="todos" title="Things To Do" subtitle="Little plans for us.">
      {todos.length > 0 ? (
        <p className="progress-badge">
          {doneCount}/{todos.length} selesai
        </p>
      ) : null}

      <form className="inline-form" onSubmit={add}>
        <label className="sr-only" htmlFor="todo-title">
          New plan
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          maxLength={100}
          placeholder="e.g. Call malam ini"
          onChange={(e) => setTitle(e.target.value)}
          disabled={!hasPerson || busy}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
          {busy ? '...' : 'Add'}
        </button>
      </form>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="empty">Nothing planned yet.</li>
        ) : (
          todos.map((item) => (
            <li key={item.id} className={`todo-row ${item.is_completed ? 'is-done' : ''}`}>
              <label>
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  disabled={busy}
                  onChange={() => toggle(item)}
                />
                <span>
                  {item.title}
                  <small>
                    by {getPersonName(item.person)}
                    <span className="todo-status">
                      {item.is_completed ? 'Tercapai' : 'Rencana'}
                    </span>
                  </small>
                </span>
              </label>
              <button
                type="button"
                className="linkish"
                disabled={busy}
                onClick={() => setPendingDelete(item.id)}
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this plan?"
        message="This can't be undone."
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Section>
  )
}
