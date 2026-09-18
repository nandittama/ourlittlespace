import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import { validateImageFile, getImageExtension, compressImage } from '../utils/image'
import { formatShortDate } from '../utils/date'
import { getPersonName } from '../config'
import MemoryCard from '../components/MemoryCard'
import PersonPicker from '../components/PersonPicker'
import ConnectionError from '../components/ConnectionError'
import Loading from '../components/Loading'

const PAGE_SIZE = 12

function publicImageUrl(path) {
  const { data } = supabase.storage.from('memories').getPublicUrl(path)
  return data?.publicUrl || null
}

export default function Memories() {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [failed, setFailed] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().slice(0, 10))
  const [file, setFile] = useState(null)

  const loadMemories = useCallback(async (offset = 0, append = false) => {
    if (!isSupabaseConfigured) {
      setFailed(true)
      setLoading(false)
      return
    }

    if (!append) setLoading(true)

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('memory_date', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) throw error
      const rows = data || []
      setHasMore(rows.length === PAGE_SIZE)
      setMemories((prev) => (append ? [...prev, ...rows] : rows))
    } catch (err) {
      console.error(err)
      setFailed(true)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadMemories(0, false)
  }, [loadMemories])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!hasPerson) {
      showToast('Choose who you are first.', 'error')
      return
    }

    const validationError = validateImageFile(file)
    if (validationError) {
      showToast(validationError, 'error')
      return
    }
    if (!title.trim()) {
      showToast('Please add a title.', 'error')
      return
    }

    setBusy(true)
    try {
      const compressed = await compressImage(file)
      const ext = getImageExtension(file)
      const path = `${person}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage.from('memories').upload(path, compressed, {
        contentType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        upsert: false,
      })

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('memories').insert({
        person,
        title: title.trim(),
        description: description.trim() || null,
        image_url: path,
        memory_date: memoryDate,
      })

      if (insertError) {
        await supabase.storage.from('memories').remove([path])
        throw insertError
      }

      setTitle('')
      setDescription('')
      setFile(null)
      setShowForm(false)
      showToast('Saved.', 'success')
      await loadMemories(0, false)
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (memory) => {
    if (!window.confirm('Delete this memory?')) return
    setBusy(true)
    try {
      const { error } = await supabase.from('memories').delete().eq('id', memory.id)
      if (error) throw error
      if (memory.image_url) {
        await supabase.storage.from('memories').remove([memory.image_url])
      }
      setMemories((prev) => prev.filter((m) => m.id !== memory.id))
      if (lightbox?.id === memory.id) setLightbox(null)
      showToast('Deleted.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!isSupabaseConfigured || failed) return <ConnectionError />
  if (loading && memories.length === 0) return <Loading />

  return (
    <div className="page fade-in">
      <header className="page-header page-header--row">
        <div>
          <h1>Memories</h1>
          <p className="muted">Small moments worth keeping.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            if (!hasPerson) {
              showToast('Choose who you are first.', 'error')
              return
            }
            setShowForm((v) => !v)
          }}
        >
          {showForm ? 'Cancel' : 'Add memory'}
        </button>
      </header>

      {!hasPerson ? <PersonPicker /> : null}

      {showForm && hasPerson && (
        <form className="panel form slide-up" onSubmit={handleCreate}>
          <label>
            Photo
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              maxLength={120}
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              required
            />
          </label>
          <label>
            Short story
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              rows={3}
              maxLength={1000}
              placeholder="Optional"
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving...' : 'Save memory'}
          </button>
        </form>
      )}

      {memories.length === 0 ? (
        <p className="empty-state">No memories yet. Maybe this is a good day to make one.</p>
      ) : (
        <>
          <div className="memory-grid">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                imageSrc={publicImageUrl(memory.image_url)}
                busy={busy}
                onOpen={(m) => setLightbox(m)}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {hasMore ? (
            <button
              type="button"
              className="btn btn--secondary btn--block"
              onClick={() => loadMemories(memories.length, true)}
            >
              Load more
            </button>
          ) : null}
        </>
      )}

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img src={publicImageUrl(lightbox.image_url)} alt={lightbox.title} />
            <div className="lightbox__meta">
              <h2>{lightbox.title}</h2>
              <p className="muted">
                {formatShortDate(lightbox.memory_date)} · {getPersonName(lightbox.person)}
              </p>
              {lightbox.description ? <p>{lightbox.description}</p> : null}
              <button type="button" className="btn btn--secondary" onClick={() => setLightbox(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
