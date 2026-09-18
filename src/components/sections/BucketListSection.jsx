import { useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { getJakartaDateString } from '../../utils/date'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function BucketListSection({ items, onChanged, onPatchItem }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const total = items.length
  const done = items.filter((i) => i.status === 'completed').length
  const progress = total ? Math.round((done / total) * 100) : 0

  const add = async (e) => {
    e.preventDefault()
    if (!hasPerson || busy) return
    const text = title.trim()
    if (!text) {
      showToast('Tulis rencananya dulu.', 'error')
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
      showToast('Ditambahkan.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (item) => {
    if (!hasPerson || togglingId === item.id) return
    const next = item.status === 'completed' ? 'planned' : 'completed'
    const completed_date = next === 'completed' ? getJakartaDateString() : null
    const prevStatus = item.status
    const prevDate = item.completed_date ?? null

    // Optimistic: ceklis langsung berubah
    onPatchItem?.(item.id, { status: next, completed_date })
    setTogglingId(item.id)

    try {
      const { error } = await supabase
        .from('bucket_items')
        .update({ status: next, completed_date })
        .eq('id', item.id)
      if (error) throw error
    } catch (err) {
      console.error(err)
      onPatchItem?.(item.id, { status: prevStatus, completed_date: prevDate })
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return
    setBusy(true)
    try {
      const { error } = await supabase.from('bucket_items').delete().eq('id', pendingDelete)
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
    <Section
      id="bucket"
      title="Our Little Bucket List"
      subtitle="Hal-hal yang ingin di lakukan"
      className="section--secondary"
    >
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
          Item baru
        </label>
        <input
          id="bucket-title"
          value={title}
          maxLength={120}
          placeholder="Add something we should do together..."
          onChange={(e) => setTitle(e.target.value)}
          disabled={!hasPerson || busy}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Belum ada di list. Apa yang ingin kita lakukan bersama?</p>
      ) : (
        <div className="scroll-panel scroll-panel--bucket" role="region" aria-label="Bucket list">
          <ul className="todo-list">
            {items.map((item) => (
              <li key={item.id} className={`todo-row ${item.status === 'completed' ? 'is-done' : ''}`}>
                <button
                  type="button"
                  className="bucket-check"
                  onClick={() => toggle(item)}
                  disabled={!hasPerson || togglingId === item.id}
                  aria-label={`Tandai ${item.title}`}
                  aria-pressed={item.status === 'completed'}
                >
                  {item.status === 'completed' ? '☑' : '☐'}
                </button>
                <div className="todo-row__main">
                  <span>{item.title}</span>
                </div>
                <button
                  type="button"
                  className="linkish"
                  disabled={busy}
                  onClick={() => setPendingDelete(item.id)}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus item ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Section>
  )
}
