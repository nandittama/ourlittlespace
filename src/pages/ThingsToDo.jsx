import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import TodoItem from '../components/TodoItem'
import ConnectionError from '../components/ConnectionError'
import Loading from '../components/Loading'

export default function ThingsToDo() {
  const { person } = usePerson()
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const loadItems = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setFailed(true)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error(err)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const addItem = async (e) => {
    e.preventDefault()
    const text = title.trim()
    if (!text) {
      showToast('Add a title first.', 'error')
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.from('todo_items').insert({
        title: text,
        person,
      })
      if (error) throw error
      setTitle('')
      showToast('Saved.', 'success')
      await loadItems()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggleItem = async (item) => {
    setBusy(true)
    try {
      const next = !item.is_completed
      const { error } = await supabase
        .from('todo_items')
        .update({
          is_completed: next,
          completed_by: next ? person : null,
          completed_at: next ? new Date().toISOString() : null,
        })
        .eq('id', item.id)

      if (error) throw error
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                is_completed: next,
                completed_by: next ? person : null,
                completed_at: next ? new Date().toISOString() : null,
              }
            : i
        )
      )
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const deleteItem = async (id) => {
    setBusy(true)
    try {
      const { error } = await supabase.from('todo_items').delete().eq('id', id)
      if (error) throw error
      setItems((prev) => prev.filter((i) => i.id !== id))
      showToast('Deleted.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const filtered = items.filter((item) => {
    if (filter === 'active') return !item.is_completed
    if (filter === 'completed') return item.is_completed
    return true
  })

  if (!isSupabaseConfigured || failed) return <ConnectionError />
  if (loading) return <Loading />

  return (
    <div className="page fade-in">
      <header className="page-header">
        <h1>Things To Do</h1>
        <p className="muted">Activities you want to do together.</p>
      </header>

      <form className="panel form row-form" onSubmit={addItem}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 200))}
          placeholder="e.g. Ngopi bersama"
          maxLength={200}
        />
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving...' : 'Add'}
        </button>
      </form>

      <div className="filter-tabs">
        {['all', 'active', 'completed'].map((key) => (
          <button
            key={key}
            type="button"
            className={`filter-tab ${filter === key ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">Nothing planned yet.</p>
      ) : (
        <ul className="todo-list">
          {filtered.map((item) => (
            <TodoItem
              key={item.id}
              item={item}
              onToggle={toggleItem}
              onDelete={deleteItem}
              busy={busy}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
