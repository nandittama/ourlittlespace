import { useMemo, useState } from 'react'
import Section from '../Section'
import { getOtherPerson, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function SecretMailboxSection({ letters, onChanged }) {
  const { person, hasPerson, partnerName } = usePerson()
  const { showToast } = useToast()
  const [openLetter, setOpenLetter] = useState(null)
  const [writing, setWriting] = useState(false)
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)

  // Surat yang menunggu dibaca oleh persona aktif
  const waiting = useMemo(
    () => (letters || []).filter((l) => l.receiver === person),
    [letters, person]
  )

  // Surat yang sudah dikirim ke pasangan dan belum dibuka
  const outgoingPending = useMemo(
    () => (letters || []).filter((l) => l.sender === person),
    [letters, person]
  )

  const canWrite = hasPerson && outgoingPending.length === 0

  const openOne = async () => {
    if (!hasPerson || busy) return
    if (!waiting.length) {
      showToast('Belum ada surat untukmu.', 'error')
      return
    }
    const letter = waiting[0]
    setOpenLetter(letter)
  }

  const closeLetter = async () => {
    if (!openLetter?.id) {
      setOpenLetter(null)
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.from('secret_letters').delete().eq('id', openLetter.id)
      if (error) throw error
      setOpenLetter(null)
      showToast('Surat ditutup.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const create = async (e) => {
    e.preventDefault()
    if (!canWrite || busy) return
    if (outgoingPending.length > 0) {
      showToast('Tunggu sampai surat sebelumnya dibuka dulu.', 'error')
      return
    }
    const text = content.trim()
    if (!text) {
      showToast('Tulis suratnya dulu.', 'error')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.from('secret_letters').insert({
        sender: person,
        receiver: getOtherPerson(person),
        content: text,
        open_on: null,
      })
      if (error) throw error
      setContent('')
      setWriting(false)
      showToast('Surat tersimpan. Tunggu sampai dibuka.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggleWrite = () => {
    if (writing) {
      setWriting(false)
      return
    }
    if (!canWrite) {
      showToast('Tunggu sampai surat sebelumnya dibuka dulu.', 'error')
      return
    }
    setWriting(true)
  }

  return (
    <Section
      id="mailbox"
      title="Secret Mailbox"
      subtitle="Satu surat pada satu waktu — buka dulu baru bisa kirim lagi."
      className="section--secondary"
    >
      <div className="mailbox-card mailbox-card--block">
        <div>
          <p className="mailbox-card__title">💌 Secret Mailbox</p>
          <p className="muted tiny">
            {waiting.length > 0
              ? `${waiting.length} surat menunggu untukmu...`
              : outgoingPending.length > 0
                ? `Surat untuk ${partnerName} masih menunggu dibuka.`
                : 'Belum ada surat rahasia untukmu.'}
          </p>
        </div>
        <div className="mailbox-actions">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={openOne}
            disabled={busy || !waiting.length}
          >
            Buka surat
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={toggleWrite}
            disabled={busy || (!writing && !canWrite)}
            title={!canWrite ? 'Tunggu sampai surat sebelumnya dibuka' : undefined}
          >
            {writing ? 'Batal' : 'Tulis surat'}
          </button>
        </div>
      </div>

      {writing && canWrite ? (
        <form className="card form-card" onSubmit={create}>
          <label className="field">
            <span>Untuk {partnerName}</span>
            <textarea
              rows={4}
              maxLength={1000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Baca ini nanti, ya..."
              disabled={busy}
            />
          </label>
          <p className="muted tiny">Hanya satu surat aktif. Kirim lagi setelah dibuka.</p>
          <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
            {busy ? 'Menyimpan...' : 'Simpan surat'}
          </button>
        </form>
      ) : null}

      {openLetter ? (
        <div className="confirm-modal" role="dialog" aria-modal="true">
          <div className="confirm-modal__card">
            <h2>Sebuah surat untukmu</h2>
            <p className="love-note__body">“{openLetter.content}”</p>
            <p className="muted tiny">Dari {getPersonName(openLetter.sender)}</p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={closeLetter}
            >
              {busy ? '...' : 'Tutup'}
            </button>
          </div>
        </div>
      ) : null}
    </Section>
  )
}
