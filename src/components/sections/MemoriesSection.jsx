import { useEffect, useMemo, useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { validateImageFile, getImageExtension, compressImage } from '../../utils/image'
import { formatShortDate, getJakartaDateString } from '../../utils/date'

function publicUrl(path) {
  const { data } = supabase.storage.from('memories').getPublicUrl(path)
  return data?.publicUrl || null
}

export default function MemoriesSection({ memories, onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [memoryDate, setMemoryDate] = useState(getJakartaDateString())
  const [file, setFile] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const create = async (e) => {
    e.preventDefault()
    if (!hasPerson || busy) return

    const validation = validateImageFile(file)
    if (validation) {
      showToast(validation, 'error')
      return
    }
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      showToast('Add a title first.', 'error')
      return
    }
    if (cleanTitle.length > 100) {
      showToast('Title can be up to 100 characters.', 'error')
      return
    }
    if (description.trim().length > 500) {
      showToast('Description can be up to 500 characters.', 'error')
      return
    }

    setBusy(true)
    let path = null
    try {
      const compressed = await compressImage(file)
      const ext = getImageExtension(file)
      path = `${person}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage.from('memories').upload(path, compressed, {
        contentType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        upsert: false,
      })
      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('memories').insert({
        person,
        title: cleanTitle,
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
      setMemoryDate(getJakartaDateString())
      setOpen(false)
      showToast('Saved.', 'success')
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
      const { error } = await supabase.from('memories').delete().eq('id', pendingDelete.id)
      if (error) throw error
      if (pendingDelete.image_url) {
        await supabase.storage.from('memories').remove([pendingDelete.image_url])
      }
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
    <Section id="memories" title="Little Memories" subtitle="Things worth keeping.">
      <div className="section-actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setOpen((v) => !v)}
          disabled={busy}
        >
          {open ? 'Cancel' : 'Add memory'}
        </button>
      </div>

      {open ? (
        <form className="card form-card" onSubmit={create}>
          <label className="field">
            <span>Photo</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const next = e.target.files?.[0] || null
                const err = validateImageFile(next)
                if (next && err) {
                  showToast(err, 'error')
                  e.target.value = ''
                  setFile(null)
                  return
                }
                setFile(next)
              }}
              required
            />
          </label>
          {previewUrl ? (
            <div className="memory-preview">
              <img src={previewUrl} alt="Preview before upload" />
            </div>
          ) : null}
          <label className="field">
            <span>Title</span>
            <input
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={busy}
            />
          </label>
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              required
              disabled={busy}
            />
          </label>
          <label className="field">
            <span>Short story</span>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              disabled={busy}
            />
            <span className="field-hint">{description.trim().length}/500</span>
          </label>
          <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
            {busy ? 'Saving...' : 'Save memory'}
          </button>
        </form>
      ) : null}

      {memories.length === 0 ? (
        <p className="empty">Start with one little memory.</p>
      ) : (
        <div className="memory-grid">
          {memories.map((memory) => (
            <article key={memory.id} className="memory-item polaroid">
              <img src={publicUrl(memory.image_url)} alt={memory.title} loading="lazy" />
              <div className="memory-item__body">
                <h3>{memory.title}</h3>
                <p className="muted tiny">
                  {formatShortDate(memory.memory_date)} · {getPersonName(memory.person)}
                </p>
                {memory.description ? <p className="tiny">{memory.description}</p> : null}
                {hasPerson && memory.person === person ? (
                  <button
                    type="button"
                    className="linkish"
                    disabled={busy}
                    onClick={() => setPendingDelete(memory)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this memory?"
        message="The photo will be removed too."
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Section>
  )
}
