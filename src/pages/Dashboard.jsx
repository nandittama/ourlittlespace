import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import {
  getGreeting,
  formatRelativeTime,
  getDaysTogether,
} from '../utils/date'
import {
  APP_NAME,
  RELATIONSHIP_START,
  SPACE_LOCATION,
  SPACE_WEATHER,
  PERSON_ONE_NAME,
  PERSON_TWO_NAME,
  STORAGE_KEY_BATTERY,
  getOtherPerson,
  getPersonName,
  getPersonConfig,
} from '../config'
import { DASHBOARD_MOODS, getMoodDisplay } from '../utils/moods'
import ConnectionError from '../components/ConnectionError'
import Loading from '../components/Loading'
import QuickMessage from '../components/QuickMessage'

function publicImageUrl(path) {
  if (!path) return null
  const { data } = supabase.storage.from('memories').getPublicUrl(path)
  return data?.publicUrl || null
}

function Avatar({ name, size = 'md' }) {
  const initial = (name || '?').slice(0, 1).toUpperCase()
  return <div className={`avatar avatar--${size}`}>{initial}</div>
}

export default function Dashboard() {
  const { person, personName } = usePerson()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const partnerKey = getOtherPerson(person)
  const partnerName = getPersonName(partnerKey)
  const partnerTag = getPersonConfig(partnerKey)?.tag || 'Partner'
  const daysTogether = useMemo(() => getDaysTogether(RELATIONSHIP_START), [])

  const [myMood, setMyMood] = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  const [partnerNote, setPartnerNote] = useState(null)
  const [partnerActivityAt, setPartnerActivityAt] = useState(null)
  const [todoCount, setTodoCount] = useState(0)
  const [latestMemory, setLatestMemory] = useState(null)
  const [battery, setBattery] = useState(() => {
    try {
      const v = Number(localStorage.getItem(STORAGE_KEY_BATTERY))
      return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 85
    } catch {
      return 85
    }
  })
  const [savingMood, setSavingMood] = useState(false)
  const [sendingLove, setSendingLove] = useState(false)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured || !person) {
      setFailed(!isSupabaseConfigured)
      setLoading(false)
      return
    }

    setLoading(true)
    setFailed(false)
    try {
      const [moodsRes, notesRes, todosRes, memoriesRes, messagesRes] = await Promise.all([
        supabase.from('moods').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('todo_items').select('id,is_completed').eq('is_completed', false),
        supabase.from('memories').select('*').order('memory_date', { ascending: false }).limit(1),
        supabase.from('quick_messages').select('*').order('created_at', { ascending: false }).limit(10),
      ])

      if (moodsRes.error) throw moodsRes.error
      if (notesRes.error) throw notesRes.error
      if (todosRes.error) throw todosRes.error
      if (memoriesRes.error) throw memoriesRes.error
      if (messagesRes.error) throw messagesRes.error

      const latestMood = {}
      for (const row of moodsRes.data || []) {
        if (!latestMood[row.person]) latestMood[row.person] = row
      }
      setMyMood(latestMood[person] || null)
      setPartnerMood(latestMood[partnerKey] || null)

      const partnerNotes = (notesRes.data || []).filter((n) => n.person === partnerKey)
      setPartnerNote(partnerNotes[0] || null)

      const activityCandidates = [
        latestMood[partnerKey]?.created_at,
        partnerNotes[0]?.created_at,
        (messagesRes.data || []).find((m) => m.person === partnerKey)?.created_at,
      ].filter(Boolean)
      if (activityCandidates.length) {
        activityCandidates.sort((a, b) => new Date(b) - new Date(a))
        setPartnerActivityAt(activityCandidates[0])
      } else {
        setPartnerActivityAt(null)
      }

      setTodoCount((todosRes.data || []).length)
      setLatestMemory((memoriesRes.data || [])[0] || null)
    } catch (err) {
      console.error(err)
      setFailed(true)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [person, partnerKey, showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveMood = async (mood) => {
    setSavingMood(true)
    try {
      const { data, error } = await supabase
        .from('moods')
        .insert({
          person,
          mood_key: mood.key,
          mood_emoji: mood.emoji,
          mood_label: mood.label,
        })
        .select()
        .single()
      if (error) throw error
      setMyMood(data)
      showToast('Mood saved.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSavingMood(false)
    }
  }

  const sendLove = async () => {
    setSendingLove(true)
    try {
      const { error } = await supabase.from('quick_messages').insert({
        person,
        type: 'miss_you',
        message: '❤️ I miss you',
      })
      if (error) throw error
      showToast('Love sent.', 'success')
      await loadData()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSendingLove(false)
    }
  }

  const updateBattery = (value) => {
    const next = Number(value)
    setBattery(next)
    try {
      localStorage.setItem(STORAGE_KEY_BATTERY, String(next))
    } catch {
      /* ignore */
    }
  }

  if (!isSupabaseConfigured || failed) return <ConnectionError />
  if (loading) return <Loading label="Loading your space..." />

  const partnerMoodView = getMoodDisplay(partnerMood)
  const partnerSnippet =
    partnerNote?.content ||
    partnerMood?.message ||
    (partnerMoodView ? `Feeling ${partnerMoodView.label}` : 'No update yet today.')

  return (
    <div className="home fade-in">
      <header className="home-topbar">
        <div className="home-topbar__left">
          <div>
            <p className="home-brand">
              {APP_NAME} <span aria-hidden="true">❤️</span>
            </p>
            <p className="home-couple">
              {PERSON_ONE_NAME} & {PERSON_TWO_NAME}
            </p>
          </div>
          <span className="pill pill--days">{daysTogether} Days</span>
        </div>
        <Link to="/profile" className="home-topbar__avatar" aria-label="Profile">
          <Avatar name={personName} />
        </Link>
      </header>

      <section className="hero-card">
        <div className="hero-card__main">
          <p className="hero-kicker">Home</p>
          <h1>
            {getGreeting(personName)} <span aria-hidden="true">❤️</span>
          </h1>
          <p className="muted">
            {partnerActivityAt
              ? `${partnerName} was active ${formatRelativeTime(partnerActivityAt)}`
              : `${partnerName} hasn't checked in yet`}
          </p>
        </div>
        <div className="hero-card__badges">
          <span className="pill">
            {SPACE_LOCATION} · {SPACE_WEATHER}
          </span>
          <span className="pill pill--soft">Day {daysTogether} Together</span>
        </div>
      </section>

      <div className="home-grid">
        <section className="panel partner-card">
          <div className="partner-card__head">
            <Avatar name={partnerName} size="lg" />
            <div>
              <div className="partner-card__name-row">
                <h2>{partnerName}</h2>
                <span className="tag">{partnerTag}</span>
              </div>
              <p className="muted">
                {partnerActivityAt ? formatRelativeTime(partnerActivityAt) : 'Waiting for update'}
              </p>
            </div>
          </div>
          <blockquote className="partner-quote">“{partnerSnippet}”</blockquote>
          <div className="partner-actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={sendingLove}
              onClick={sendLove}
            >
              {sendingLove ? 'Sending...' : '❤️ Send Love'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => navigate('/notes')}>
              Reply
            </button>
          </div>
        </section>

        <section className="mood-stack">
          <div className="panel mood-checkin">
            <div className="mood-checkin__head">
              <h2>Your Mood</h2>
              <span className={`badge ${myMood ? 'badge--ok' : ''}`}>
                {myMood ? 'Checked in' : 'Pending check-in'}
              </span>
            </div>
            <div className="mood-chips">
              {DASHBOARD_MOODS.map((mood) => (
                <button
                  key={mood.key}
                  type="button"
                  className={`mood-chip ${myMood?.mood_key === mood.key ? 'mood-chip--active' : ''}`}
                  disabled={savingMood}
                  onClick={() => saveMood(mood)}
                >
                  <span aria-hidden="true">{mood.emoji}</span>
                  {mood.label}
                </button>
              ))}
            </div>
            <p className="muted mood-checkin__foot">
              {myMood
                ? `Today: ${myMood.mood_emoji} ${myMood.mood_label}`
                : 'Tap a mood to check in'}
            </p>
          </div>

          <div className="panel partner-mood-panel">
            <h2>{partnerName}&apos;s Mood</h2>
            {partnerMoodView ? (
              <>
                <p className="partner-mood-label">
                  <span aria-hidden="true">{partnerMoodView.emoji}</span> {partnerMoodView.label}
                </p>
                {partnerMood?.message ? <p className="muted">{partnerMood.message}</p> : null}
              </>
            ) : (
              <p className="muted">No mood shared yet.</p>
            )}

            <label className="battery">
              <div className="battery__head">
                <span>Social battery</span>
                <strong>{battery}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={battery}
                onChange={(e) => updateBattery(e.target.value)}
              />
            </label>
          </div>
        </section>
      </div>

      <section className="quick-nav">
        <Link to="/mood" className="quick-nav__item">
          <span className="quick-nav__icon">😊</span>
          <div>
            <strong>Mood</strong>
            <p>Daily check-in</p>
          </div>
        </Link>
        <Link to="/notes" className="quick-nav__item">
          <span className="quick-nav__icon">✎</span>
          <div>
            <strong>Notes</strong>
            <p>Shared thoughts</p>
          </div>
        </Link>
        <Link to="/things-to-do" className="quick-nav__item">
          <span className="quick-nav__icon">✓</span>
          <div>
            <strong>To-Do</strong>
            <p>Plans together</p>
          </div>
          {todoCount > 0 ? <span className="count-badge">{todoCount}</span> : null}
        </Link>
        <Link to="/memories" className="quick-nav__item">
          <span className="quick-nav__icon">◇</span>
          <div>
            <strong>Memories</strong>
            <p>Little moments</p>
          </div>
        </Link>
      </section>

      <QuickMessage partnerName={partnerName} onSent={loadData} />

      <section className="panel memory-spotlight">
        <div className="memory-spotlight__head">
          <h2>Shared Memory</h2>
          {latestMemory ? <span className="pill pill--soft">Latest</span> : null}
        </div>
        {latestMemory ? (
          <button
            type="button"
            className="memory-spotlight__body"
            onClick={() => navigate('/memories')}
          >
            <div className="memory-spotlight__media">
              {publicImageUrl(latestMemory.image_url) ? (
                <img
                  src={publicImageUrl(latestMemory.image_url)}
                  alt={latestMemory.title}
                  loading="lazy"
                />
              ) : (
                <div className="memory-spotlight__placeholder">Photo</div>
              )}
            </div>
            <div className="memory-spotlight__copy">
              <h3>{latestMemory.title}</h3>
              {latestMemory.description ? <p>{latestMemory.description}</p> : null}
              <p className="muted">
                {getPersonName(latestMemory.person)} · {latestMemory.memory_date}
              </p>
            </div>
          </button>
        ) : (
          <div className="empty-inline">
            <p className="muted">No memories yet.</p>
            <Link to="/memories" className="btn btn--secondary btn--sm">
              Add one
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
