import { useState } from 'react'
import Section from '../Section'
import { MOODS } from '../../utils/moods'
import { formatRelativeTime, getJakartaDateString } from '../../utils/date'
import { getOtherPerson, getPersonName } from '../../config'
import { usePerson } from '../../context/PersonContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

function MoodSide({ title, mood, emptyText }) {
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
          <p className="muted tiny">Updated {formatRelativeTime(mood.updated_at || mood.created_at)}</p>
        </>
      ) : (
        <p className="muted">{emptyText}</p>
      )}
    </div>
  )
}

export default function MoodSection({ myMood, partnerMood, onChanged }) {
  const { person, hasPerson, personName } = usePerson()
  const { showToast } = useToast()
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const partnerKey = hasPerson ? getOtherPerson(person) : 'dia'
  const partnerName = getPersonName(partnerKey)

  const save = async () => {
    if (!hasPerson || saving) return
    const mood = MOODS.find((m) => m.key === selected)
    if (!mood) {
      showToast('Pick a mood first.', 'error')
      return
    }

    setSaving(true)
    try {
      const moodDate = getJakartaDateString()
      const payload = {
        person,
        mood_key: mood.key,
        mood_emoji: mood.emoji,
        mood_label: mood.label,
        message: message.trim() || null,
        mood_date: moodDate,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('moods').upsert(payload, {
        onConflict: 'person,mood_date',
      })
      if (error) throw error

      setMessage('')
      showToast('Mood saved.', 'success')
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
        <MoodSide
          title="You"
          mood={myMood}
          emptyText="How are you feeling today?"
        />
        <MoodSide
          title={partnerName}
          mood={partnerMood}
          emptyText={`${partnerName} hasn't checked in yet.`}
        />
      </div>

      <div className="card mood-picker-card">
        <p className="card-label">Update your mood{personName ? `, ${personName}` : ''}</p>
        <div className="mood-choices" role="group" aria-label="Mood choices">
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
          <span>Want to say something?</span>
          <input
            type="text"
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional, max 200 characters"
            disabled={!hasPerson || saving}
          />
        </label>
        <button
          type="button"
          className="btn btn--primary"
          disabled={saving || !hasPerson || !selected}
          onClick={save}
        >
          {saving ? 'Saving...' : 'Save mood'}
        </button>
      </div>
    </Section>
  )
}
