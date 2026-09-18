import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import Section from '../Section'
import ConfirmDialog from '../ConfirmDialog'
import { getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { validateImageFile, getImageExtension, compressImage } from '../../utils/image'
import { formatMonthYear, formatShortDate, getJakartaDateString } from '../../utils/date'

function publicUrl(path) {
  const { data } = supabase.storage.from('memories').getPublicUrl(path)
  return data?.publicUrl || null
}

const MemoriesSection = forwardRef(function MemoriesSection({ memories, onChanged }, ref) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [memoryDate, setMemoryDate] = useState(getJakartaDateString())
  const [file, setFile] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [surprise, setSurprise] = useState(null)

  useImperativeHandle(ref, () => ({
    openUpload: () => setOpen(true),
  }))

  const surpriseMe = () => {
    if (!memories.length) {
      showToast('Belum ada memory untuk diingat.', 'error')
      return
    }
    const pick = memories[Math.floor(Math.random() * memories.length)]
    setSurprise(pick)
  }

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  useEffect(() => {
    if (!lightbox) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

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
    setBusy(true)
    let path = null
    try {
      const compressed = await compressImage(file)
      path = `${person}/${crypto.randomUUID()}.${getImageExtension(file)}`
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
      setLightbox(null)
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
    <Section id="memories" title="Little Memories" subtitle="Beberapa momen layak dikenang.">
      <div className="section-actions row-between">
        <div className="row-between" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--secondary" onClick={() => setOpen((v) => !v)}>
            {open ? 'Batal' : 'Tambah memory'}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={surpriseMe}>
            ✨ Surprise Me
          </button>
        </div>
        {memories.length > 0 ? (
          <span className="progress-badge">{memories.length} tersimpan</span>
        ) : null}
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
            <input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.target.value)} required />
          </label>
          <label className="field">
            <span>Caption</span>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One of those evenings we didn't want to end."
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
            {busy ? 'Saving...' : 'Save memory'}
          </button>
        </form>
      ) : null}

      {memories.length === 0 ? (
        <p className="empty">Belum ada memory 🤍 Yuk buat yang pertama.</p>
      ) : (
        <div className="scroll-panel scroll-panel--memories" role="region" aria-label="Daftar memories">
          <div className="memory-grid">
            {memories.map((memory) => (
              <button
                key={memory.id}
                type="button"
                className="memory-item polaroid"
                onClick={() => setLightbox(memory)}
              >
                <img src={publicUrl(memory.image_url)} alt={memory.title} loading="lazy" />
                <div className="memory-item__body">
                  <p className="polaroid-date">{formatMonthYear(memory.memory_date)}</p>
                  <h3>{memory.title}</h3>
                  {memory.description ? <p className="tiny">{memory.description}</p> : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {surprise ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Remember this?"
          onClick={() => setSurprise(null)}
        >
          <div className="lightbox__card" onClick={(e) => e.stopPropagation()}>
            <img src={publicUrl(surprise.image_url)} alt={surprise.title} />
            <div className="lightbox__body">
              <p className="muted tiny">Remember this?</p>
              <h3>{surprise.title}</h3>
              <p className="muted tiny">{formatShortDate(surprise.memory_date)}</p>
              {surprise.description ? <p>“{surprise.description}”</p> : null}
              <button type="button" className="btn btn--secondary" onClick={() => setSurprise(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
        >
          <div className="lightbox__card" onClick={(e) => e.stopPropagation()}>
            <img src={publicUrl(lightbox.image_url)} alt={lightbox.title} />
            <div className="lightbox__body">
              <h3>{lightbox.title}</h3>
              <p className="muted tiny">
                {formatShortDate(lightbox.memory_date)} · {getPersonName(lightbox.person)}
              </p>
              {lightbox.description ? <p>{lightbox.description}</p> : null}
              <div className="lightbox__actions">
                <button type="button" className="btn btn--secondary" onClick={() => setLightbox(null)}>
                  Close
                </button>
                {hasPerson && lightbox.person === person ? (
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => setPendingDelete(lightbox)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
})

export default MemoriesSection
