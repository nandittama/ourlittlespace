import { useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { getJakartaDateString } from '../../utils/date'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

const STATUS_LABEL = {
  planned: 'Rencana',
  someday: 'Impian',
  completed: 'Tercapai',
}

export default function BucketListSection({ items, onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const total = items.length
  const done = items.filter((i) => i.status === 'completed').length
  const progress = total ? Math.round((done / total) * 100) : 0

  const add = async (e) => {
    e.preventDefault()
    if (!hasPerson || busy) return
    const text = title.trim()
    if (!text) {
      showToast('Write a dream first.', 'error')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.from('bucket_items').insert({
        title: text,
        status: 'planned',
        created_by: person,
      })
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

  const cycleStatus = async (item) => {
    if (!hasPerson || busy) return
    const order = ['planned', 'someday', 'completed']
    const next = order[(order.indexOf(item.status) + 1) % order.length]
    setBusy(true)
    try {
      const { error } = await supabase
        .from('bucket_items')
        .update({
          status: next,
          completed_date: next === 'completed' ? getJakartaDateString() : null,
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
      const { error } = await supabase.from('bucket_items').delete().eq('id', pendingDelete)
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
    <Section id="bucket" title="Things We Want To Do" subtitle="Little dreams, slowly collected.">
      {total > 0 ? (
        <div className="bucket-progress">
          <div className="row-between">
            <span className="progress-badge">
              {done} / {total} completed
            </span>
            <span className="muted tiny">{progress}%</span>
          </div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <form className="inline-form" onSubmit={add}>
        <label className="sr-only" htmlFor="bucket-title">
          New dream
        </label>
        <input
          id="bucket-title"
          value={title}
          maxLength={120}
          placeholder="Tambah impian baru kita..."
          onChange={(e) => setTitle(e.target.value)}
          disabled={!hasPerson || busy}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson} aria-label="Add">
          +
        </button>
      </form>

      <ul className="todo-list">
        {items.length === 0 ? (
          <li className="empty">What&apos;s something you want us to do together?</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className={`todo-row ${item.status === 'completed' ? 'is-done' : ''}`}>
              <button
                type="button"
                className="bucket-check"
                onClick={() => cycleStatus(item)}
                disabled={busy || !hasPerson}
                aria-label={`Mark ${item.title}`}
              >
                {item.status === 'completed' ? '✓' : '○'}
              </button>
              <div className="todo-row__main">
                <span>{item.title}</span>
                <small>
                  <span className="todo-status">{STATUS_LABEL[item.status]}</span>
                </small>
              </div>
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
        title="Delete this dream?"
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Section>
  )
}
