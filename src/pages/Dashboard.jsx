import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import { getGreeting, formatRelativeTime, getDaysTogether } from '../utils/date'
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
  return <div className={`avatar avatar--${size}`}>{(name || '?').slice(0, 1)}</div>
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

  const moodStreak = useMemo(() => {
    // lightweight display: consecutive days with any mood by current user is complex;
    // show a soft estimate based on having checked in today
    return myMood ? 1 : 0
  }, [myMood])

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

      for (const res of [moodsRes, notesRes, todosRes, memoriesRes, messagesRes]) {
        if (res.error) throw res.error
      }

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
      activityCandidates.sort((a, b) => new Date(b) - new Date(a))
      setPartnerActivityAt(activityCandidates[0] || null)
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
    <div className="home-stack fade-in">
      {/* 1. Greeting card */}
      <section className="card hero">
        <div className="hero__top">
          <div>
            <p className="hero__brand">
              {APP_NAME} <span aria-hidden="true">♡</span>
            </p>
            <p className="muted hero__tagline">Private sanctuary & daily chronicle</p>
          </div>
          <span className="pill pill--rose">♡ Day {daysTogether} Together</span>
        </div>

        <h1 className="hero__title">
          {getGreeting(personName)}
          <span aria-hidden="true"> ♡</span>
        </h1>

        <div className="hero__status">
          <span className="status-dot" aria-hidden="true" />
          <p className="muted">
            {partnerActivityAt
              ? `${partnerName} was active ${formatRelativeTime(partnerActivityAt)}`
              : `${partnerName} hasn't checked in yet`}
            <span> · {APP_NAME}</span>
          </p>
        </div>

        <div className="hero__pills">
          <span className="pill pill--sage">
            ✦ {SPACE_LOCATION} · {SPACE_WEATHER}
          </span>
          <span className="pill pill--rose">{daysTogether} Days</span>
        </div>
      </section>

      {/* 2. Partner message */}
      <section className="card partner">
        <div className="partner__head">
          <div className="partner__who">
            <Avatar name={partnerName} size="lg" />
            <div>
              <div className="partner__name-row">
                <h2>{partnerName}</h2>
                <span className="tag">{partnerTag}</span>
              </div>
              <p className="muted">
                {partnerActivityAt ? `Sent ${formatRelativeTime(partnerActivityAt)}` : 'Waiting for update'}
              </p>
            </div>
          </div>
        </div>
        <blockquote className="partner__quote">“{partnerSnippet}”</blockquote>
        <div className="partner__actions">
          <button type="button" className="btn btn--primary" disabled={sendingLove} onClick={sendLove}>
            {sendingLove ? 'Sending...' : '♡ Send Love'}
          </button>
          <button type="button" className="btn btn--soft" onClick={() => navigate('/notes')}>
            ↩ Reply
          </button>
        </div>
      </section>

      {/* 3. Daily Mood Pulse */}
      <section className="card mood-pulse">
        <div className="mood-pulse__head">
          <h2>🌿 Daily Mood Pulse</h2>
          <span className="muted">Today</span>
        </div>

        <div className="mood-pulse__grid">
          <div className="mood-panel">
            <div className="mood-panel__head">
              <div>
                <p className="mood-panel__label">Your Mood</p>
                <p className="muted">{personName}</p>
              </div>
              <span className={`badge ${myMood ? 'badge--ok' : 'badge--pending'}`}>
                {myMood ? 'Checked in' : 'Pending check-in'}
              </span>
            </div>
            <div className="mood-grid-btns">
              {DASHBOARD_MOODS.map((mood) => (
                <button
                  key={mood.key}
                  type="button"
                  className={`mood-btn ${myMood?.mood_key === mood.key ? 'mood-btn--active' : ''}`}
                  disabled={savingMood}
                  onClick={() => saveMood(mood)}
                >
                  <span aria-hidden="true">{mood.emoji}</span>
                  {mood.label}
                </button>
              ))}
            </div>
            <p className="mood-foot muted">
              {moodStreak > 0 ? `${moodStreak}+ day streak · Keep blooming together` : 'Tap a mood to check in'}
            </p>
          </div>

          <div className="mood-panel mood-panel--partner">
            <div className="mood-panel__head">
              <div className="partner__who partner__who--sm">
                <Avatar name={partnerName} />
                <div>
                  <p className="mood-panel__label">{partnerName}&apos;s Status</p>
                  <p className="muted">
                    {partnerMood
                      ? `Updated ${formatRelativeTime(partnerMood.created_at)}`
                      : 'No update yet'}
                  </p>
                </div>
              </div>
            </div>

            <div className="partner-status-box">
              {partnerMoodView ? (
                <>
                  <p className="partner-status-box__mood">
                    {partnerMoodView.emoji} {partnerMoodView.label}
                  </p>
                  {partnerMood?.message ? <p className="muted">{partnerMood.message}</p> : null}
                </>
              ) : (
                <p className="muted">Waiting for {partnerName}&apos;s mood.</p>
              )}
            </div>

            <label className="battery">
              <div className="battery__head">
                <span>Social battery</span>
                <strong>{battery}%</strong>
              </div>
              <div className="battery__track">
                <div className="battery__fill" style={{ width: `${battery}%` }} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={battery}
                  onChange={(e) => updateBattery(e.target.value)}
                  aria-label="Social battery"
                />
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* 4. Quick links */}
      <section className="quick-grid" aria-label="Quick links">
        <Link to="/mood" className="quick-tile">
          <span className="quick-tile__icon">☺</span>
          <strong>Mood</strong>
          <p>Trends & arc</p>
        </Link>
        <Link to="/notes" className="quick-tile">
          <span className="quick-tile__icon">✉</span>
          <strong>Notes</strong>
          <p>Shared thoughts</p>
        </Link>
        <Link to="/things-to-do" className="quick-tile">
          <span className="quick-tile__icon">✓</span>
          <strong>To-Do</strong>
          <p>Plans together</p>
          {todoCount > 0 ? <span className="count-badge">{todoCount}</span> : null}
        </Link>
        <Link to="/memories" className="quick-tile">
          <span className="quick-tile__icon">✧</span>
          <strong>Memories</strong>
          <p>Albums & trips</p>
        </Link>
      </section>

      {/* 5. Say something */}
      <QuickMessage partnerName={partnerName} onSent={loadData} />

      {/* 6. Memory */}
      <section className="card memory-card-wide">
        <div className="memory-card-wide__head">
          <h2>✧ Today&apos;s Shared Memory</h2>
          {latestMemory ? <span className="pill pill--sage">Latest</span> : null}
        </div>

        {latestMemory ? (
          <button type="button" className="memory-feature" onClick={() => navigate('/memories')}>
            <div className="memory-feature__media">
              {publicImageUrl(latestMemory.image_url) ? (
                <img src={publicImageUrl(latestMemory.image_url)} alt={latestMemory.title} loading="lazy" />
              ) : (
                <div className="memory-feature__placeholder">Photo</div>
              )}
              <div className="memory-feature__overlay">
                <h3>{latestMemory.title}</h3>
              </div>
            </div>
            <div className="memory-feature__body">
              {latestMemory.description ? <p>{latestMemory.description}</p> : null}
              <div className="memory-feature__foot">
                <div className="avatar-stack">
                  <Avatar name={PERSON_ONE_NAME} size="sm" />
                  <Avatar name={PERSON_TWO_NAME} size="sm" />
                </div>
                <span className="muted">Shared together · {latestMemory.memory_date}</span>
              </div>
            </div>
          </button>
        ) : (
          <div className="empty-inline">
            <p className="muted">No memories yet. Maybe this is a good day to make one.</p>
            <Link to="/memories" className="btn btn--soft btn--sm">
              Add memory
            </Link>
          </div>
        )}
      </section>

      <footer className="home-footer">
        {APP_NAME} · Dedicated to {PERSON_ONE_NAME} & {PERSON_TWO_NAME}
      </footer>
    </div>
  )
}
