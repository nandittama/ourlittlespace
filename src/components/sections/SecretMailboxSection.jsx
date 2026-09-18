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

  // Surat untuk persona aktif saja
  const waiting = useMemo(
    () => (letters || []).filter((l) => l.receiver === person),
    [letters, person]
  )

  const openOne = async () => {
    if (!hasPerson || busy) return
    if (!waiting.length) {
      showToast('Belum ada surat untukmu.', 'error')
      return
    }
    const letter = waiting[0]
    setOpenLetter(letter)
  }

  const closeAndBurn = async () => {
    if (!openLetter?.id) {
      setOpenLetter(null)
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.from('secret_letters').delete().eq('id', openLetter.id)
      if (error) throw error
      setOpenLetter(null)
      showToast('Surat sudah dibaca dan hilang 🤍', 'success')
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
    if (!hasPerson || busy) return
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
      showToast('Surat tersimpan. Sekali dibuka, hilang.', 'success')
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
      id="mailbox"
      title="Secret Mailbox"
      subtitle="Sekali dibuka, hilang selamanya."
      className="section--secondary"
    >
      <div className="mailbox-card mailbox-card--block">
        <div>
          <p className="mailbox-card__title">💌 Secret Mailbox</p>
          <p className="muted tiny">
            {waiting.length > 0
              ? `${waiting.length} surat menunggu untukmu...`
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
            onClick={() => setWriting((v) => !v)}
          >
            {writing ? 'Batal' : 'Tulis surat'}
          </button>
        </div>
      </div>

      {writing ? (
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
          <p className="muted tiny">Surat ini hanya bisa dibuka sekali.</p>
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
            <p className="muted tiny">Setelah ditutup, surat ini hilang.</p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={closeAndBurn}
            >
              {busy ? '...' : 'Tutup & hilangkan'}
            </button>
          </div>
        </div>
      ) : null}
    </Section>
  )
}
