import { useState } from 'react'
import Section from '../Section'
import { getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { validateImageFile, getImageExtension, compressImage } from '../../utils/image'
import { formatShortDate } from '../../utils/date'

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
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().slice(0, 10))
  const [file, setFile] = useState(null)

  const create = async (e) => {
    e.preventDefault()
    if (!hasPerson) {
      showToast('Pilih identitas dulu di atas.', 'error')
      return
    }
    const validation = validateImageFile(file)
    if (validation) {
      showToast(validation, 'error')
      return
    }
    if (!title.trim()) {
      showToast('Tambah judul dulu.', 'error')
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

  const remove = async (memory) => {
    if (!window.confirm('Delete this memory?')) return
    setBusy(true)
    try {
      const { error } = await supabase.from('memories').delete().eq('id', memory.id)
      if (error) throw error
      if (memory.image_url) await supabase.storage.from('memories').remove([memory.image_url])
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
    <Section id="memories" title="Little Memories" subtitle="Moments worth keeping.">
      <div className="section-actions">
        <button type="button" className="btn btn--secondary" onClick={() => setOpen((v) => !v)}>
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
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <label className="field">
            <span>Title</span>
            <input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.target.value)} required />
          </label>
          <label className="field">
            <span>Short story</span>
            <textarea
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
            {busy ? 'Saving...' : 'Save memory'}
          </button>
        </form>
      ) : null}

      {memories.length === 0 ? (
        <p className="empty">Belum ada memory. Maybe start with one photo?</p>
      ) : (
        <div className="memory-grid">
          {memories.map((memory) => (
            <article key={memory.id} className="memory-item">
              <img src={publicUrl(memory.image_url)} alt={memory.title} loading="lazy" />
              <div className="memory-item__body">
                <h3>{memory.title}</h3>
                <p className="muted tiny">
                  {formatShortDate(memory.memory_date)} · {getPersonName(memory.person)}
                </p>
                {memory.description ? <p className="tiny">{memory.description}</p> : null}
                {hasPerson && memory.person === person ? (
                  <button type="button" className="linkish" disabled={busy} onClick={() => remove(memory)}>
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  )
}
