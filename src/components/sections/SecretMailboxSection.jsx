import { useMemo, useState } from 'react'
import Section from '../Section'
import { getJakartaDateString, formatShortDate } from '../../utils/date'
import { getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

export default function SecretMailboxSection({ letters, onChanged }) {
  const { person, hasPerson, partnerName } = usePerson()
  const { showToast } = useToast()
  const [openLetter, setOpenLetter] = useState(null)
  const [writing, setWriting] = useState(false)
  const [content, setContent] = useState('')
  const [openOn, setOpenOn] = useState('')
  const [busy, setBusy] = useState(false)

  const today = getJakartaDateString()
  const waiting = useMemo(() => letters || [], [letters])
  const nextLocked = waiting.find((l) => l.open_on && l.open_on > today)

  const openOne = () => {
    const eligible = waiting.find((l) => !l.open_on || l.open_on <= today)
    if (!eligible) {
      setOpenLetter({ locked: true, open_on: nextLocked?.open_on })
      return
    }
    setOpenLetter(eligible)
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
        receiver: person === 'nadhif' ? 'diah' : 'nadhif',
        content: text,
        open_on: openOn || null,
      })
      if (error) throw error
      setContent('')
      setOpenOn('')
      setWriting(false)
      showToast('Surat disimpan untuk nanti.', 'success')
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
      subtitle="Sesuatu yang menunggu waktu yang tepat."
      className="section--secondary"
    >
      <div className="mailbox-card mailbox-card--block">
        <div>
          <p className="mailbox-card__title">💌 Secret Mailbox</p>
          <p className="muted tiny">
            {waiting.length > 0
              ? `${waiting.length} surat menunggu...`
              : 'Belum ada surat rahasia.'}
          </p>
          {nextLocked?.open_on ? (
            <p className="muted tiny">Buka pada: {formatShortDate(nextLocked.open_on)}</p>
          ) : null}
        </div>
        <div className="mailbox-actions">
          <button type="button" className="btn btn--secondary btn--sm" onClick={openOne}>
            Open when the time comes
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
          <label className="field">
            <span>Buka pada tanggal (opsional)</span>
            <input type="date" value={openOn} onChange={(e) => setOpenOn(e.target.value)} />
          </label>
          <button type="submit" className="btn btn--primary" disabled={busy || !hasPerson}>
            {busy ? 'Menyimpan...' : 'Simpan surat'}
          </button>
        </form>
      ) : null}

      {openLetter ? (
        <div className="confirm-modal" role="dialog" aria-modal="true">
          <div className="confirm-modal__card">
            {openLetter.locked ? (
              <>
                <h2>Belum waktunya</h2>
                <p className="muted">
                  {openLetter.open_on
                    ? `Surat ini menunggu sampai ${formatShortDate(openLetter.open_on)}.`
                    : 'Surat ini masih menunggu.'}
                </p>
              </>
            ) : (
              <>
                <h2>Sebuah surat untukmu</h2>
                <p className="love-note__body">“{openLetter.content}”</p>
                <p className="muted tiny">Dari {getPersonName(openLetter.sender)}</p>
              </>
            )}
            <button type="button" className="btn btn--primary" onClick={() => setOpenLetter(null)}>
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </Section>
  )
}
