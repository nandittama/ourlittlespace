import { useState } from 'react'
import Section from '../Section'
import { MOODS } from '../../utils/moods'
import { formatRelativeTime } from '../../utils/date'
import { getOtherPerson, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

function MoodSide({ title, mood }) {
  return (
    <div className="mood-side">
      <p className="mood-side__who">{title}</p>
      {mood ? (
        <>
          <p className="mood-side__emoji" aria-hidden="true">
            {mood.mood_emoji}
          </p>
          <p className="mood-side__label">Feeling {mood.mood_label}</p>
          {mood.message ? <p className="mood-side__msg">“{mood.message}”</p> : null}
          <p className="muted tiny">Updated {formatRelativeTime(mood.created_at)}</p>
        </>
      ) : (
        <p className="muted">Belum ada mood hari ini.</p>
      )}
    </div>
  )
}

export default function MoodSection({ myMood, partnerMood, onChanged }) {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!hasPerson) {
      showToast('Pilih identitas dulu di atas.', 'error')
      return
    }
    const mood = MOODS.find((m) => m.key === selected)
    if (!mood) {
      showToast('Pilih mood dulu.', 'error')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('moods').insert({
        person,
        mood_key: mood.key,
        mood_emoji: mood.emoji,
        mood_label: mood.label,
        message: message.trim() || null,
      })
      if (error) throw error
      setMessage('')
      showToast('Saved.', 'success')
      onChanged?.()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section id="mood" title="How are we feeling?" subtitle="A tiny check-in for today.">
      <div className="mood-duo">
        <MoodSide title={hasPerson ? 'You' : getPersonName('kamu')} mood={myMood} />
        <MoodSide
          title={hasPerson ? getPersonName(getOtherPerson(person)) : getPersonName('dia')}
          mood={partnerMood}
        />
      </div>

      <div className="card mood-picker-card">
        <p className="card-label">Update your mood</p>
        <div className="mood-choices">
          {MOODS.map((mood) => (
            <button
              key={mood.key}
              type="button"
              className={`mood-choice ${selected === mood.key ? 'is-active' : ''}`}
              onClick={() => setSelected(mood.key)}
            >
              <span aria-hidden="true">{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Want to say something?</span>
          <input
            type="text"
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional short message"
            disabled={!hasPerson}
          />
        </label>
        <button type="button" className="btn btn--primary" disabled={saving || !hasPerson} onClick={save}>
          {saving ? 'Saving...' : 'Save mood'}
        </button>
      </div>
    </Section>
  )
}
