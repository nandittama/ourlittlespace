import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import { MOODS, getMoodHint } from '../utils/moods'
import { getOtherPerson, getPersonName } from '../config'
import MoodCard from '../components/MoodCard'
import PersonPicker from '../components/PersonPicker'
import ConnectionError from '../components/ConnectionError'
import Loading from '../components/Loading'

export default function Mood() {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [myMood, setMyMood] = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  const loadMoods = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setFailed(true)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const latest = {}
      for (const row of data || []) {
        if (!latest[row.person]) latest[row.person] = row
      }

      if (hasPerson) {
        setMyMood(latest[person] || null)
        setPartnerMood(latest[getOtherPerson(person)] || null)
        if (latest[person]) setSelected(latest[person].mood_key)
      } else {
        setMyMood(latest.kamu || null)
        setPartnerMood(latest.dia || null)
      }
    } catch (err) {
      console.error(err)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [hasPerson, person])

  useEffect(() => {
    loadMoods()
  }, [loadMoods])

  const saveMood = async () => {
    if (!hasPerson) {
      showToast('Choose who you are first.', 'error')
      return
    }

    const mood = MOODS.find((m) => m.key === selected)
    if (!mood) {
      showToast('Please choose a mood.', 'error')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('moods')
        .insert({
          person,
          mood_key: mood.key,
          mood_emoji: mood.emoji,
          mood_label: mood.label,
          message: message.trim() || null,
        })
        .select()
        .single()

      if (error) throw error
      setMyMood(data)
      setMessage('')
      showToast('Saved.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isSupabaseConfigured || failed) return <ConnectionError />
  if (loading) return <Loading />

  return (
    <div className="page fade-in">
      <header className="page-header">
        <h1>Mood</h1>
        <p className="muted">Share how you feel today.</p>
      </header>

      {!hasPerson ? <PersonPicker /> : null}

      <section className="mood-grid">
        <MoodCard
          title={hasPerson ? 'You' : getPersonName('kamu')}
          mood={myMood}
          emptyText="You haven't shared your mood today."
        />
        <MoodCard
          title={hasPerson ? getPersonName(getOtherPerson(person)) : getPersonName('dia')}
          mood={partnerMood}
          emptyText="No mood shared yet."
          hint={partnerMood ? getMoodHint(partnerMood.mood_key) : null}
        />
      </section>

      <section className="panel">
        <h2>How are you?</h2>
        <div className="mood-picker">
          {MOODS.map((mood) => (
            <button
              key={mood.key}
              type="button"
              className={`mood-option ${selected === mood.key ? 'mood-option--active' : ''}`}
              onClick={() => setSelected(mood.key)}
            >
              <span aria-hidden="true">{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>

        <label className="form-label">
          Want to say something?
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            maxLength={200}
            rows={3}
            placeholder="Optional short message"
          />
          <span className="char-count">{message.length}/200</span>
        </label>

        <button
          type="button"
          className="btn btn--primary"
          disabled={saving || !selected || !hasPerson}
          onClick={saveMood}
        >
          {saving ? 'Saving...' : 'Save mood'}
        </button>
      </section>
    </div>
  )
}
