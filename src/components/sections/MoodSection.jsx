import { useState } from 'react'
import Section from '../Section'
import { MOODS } from '../../utils/moods'
import { formatRelativeTime, getJakartaDateString } from '../../utils/date'
import { PERSON_ONE, PERSON_TWO, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

function MoodCard({ name, mood }) {
  return (
    <div className="mood-side">
      <p className="mood-side__who">{name}</p>
      {mood ? (
        <>
          <p className="mood-side__emoji" aria-hidden="true">
            {mood.mood_emoji}
          </p>
          <p className="mood-side__label">{mood.mood_label}</p>
          {mood.message ? <p className="mood-side__msg">“{mood.message}”</p> : null}
          <p className="muted tiny">
            Diperbarui {formatRelativeTime(mood.updated_at || mood.created_at)}
          </p>
        </>
      ) : (
        <p className="muted">Bagaimana perasaanmu hari ini?</p>
      )}
    </div>
  )
}

export default function MoodSection({ moodOne, moodTwo, onChanged }) {
  const { person, hasPerson, personName } = usePerson()
  const { showToast } = useToast()
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!hasPerson || saving) return
    const mood = MOODS.find((m) => m.key === selected)
    if (!mood) {
      showToast('Pilih mood dulu ya.', 'error')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('moods').upsert(
        {
          person,
          mood_key: mood.key,
          mood_emoji: mood.emoji,
          mood_label: mood.label,
          message: message.trim() || null,
          mood_date: getJakartaDateString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'person,mood_date' }
      )
      if (error) throw error
      setMessage('')
      showToast('Mood tersimpan.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Ada yang kurang beres 🤍 Coba lagi ya.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section id="mood" title="Our Mood" subtitle="Check-in kecil untuk hari ini.">
      <div className="mood-duo">
        <MoodCard name={getPersonName(PERSON_ONE)} mood={moodOne} />
        <MoodCard name={getPersonName(PERSON_TWO)} mood={moodTwo} />
      </div>

      <div className="card form-card">
        <p className="card-label">Bagaimana perasaanmu hari ini?{personName ? ` · ${personName}` : ''}</p>
        <div className="mood-choices" role="group" aria-label="Pilihan mood">
          {MOODS.map((mood) => (
            <button
              key={mood.key}
              type="button"
              className={`mood-choice ${selected === mood.key ? 'is-active' : ''}`}
              aria-pressed={selected === mood.key}
              onClick={() => setSelected(mood.key)}
            >
              <span aria-hidden="true">{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Mau bilang sesuatu? (opsional)</span>
          <input
            type="text"
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Feeling good today ❤️"
            disabled={!hasPerson || saving}
          />
        </label>
        <button
          type="button"
          className="btn btn--primary"
          disabled={saving || !hasPerson || !selected}
          onClick={save}
        >
          {saving ? 'Menyimpan...' : 'Simpan mood'}
        </button>
      </div>
    </Section>
  )
}
