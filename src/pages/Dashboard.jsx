import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import { getGreeting, formatTodayLong, formatRelativeTime } from '../utils/date'
import { getOtherPerson, getPersonName, APP_NAME } from '../config'
import { getMoodHint } from '../utils/moods'
import MoodCard from '../components/MoodCard'
import QuickMessage from '../components/QuickMessage'
import PersonPicker from '../components/PersonPicker'
import ConnectionError from '../components/ConnectionError'
import Loading from '../components/Loading'

export default function Dashboard() {
  const { person, personName, hasPerson, switchPerson } = usePerson()
  const { showToast } = useToast()
  const [myMood, setMyMood] = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setFailed(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setFailed(false)
    try {
      const [moodsRes, messagesRes] = await Promise.all([
        supabase.from('moods').select('*').order('created_at', { ascending: false }).limit(20),
        supabase
          .from('quick_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8),
      ])

      if (moodsRes.error) throw moodsRes.error
      if (messagesRes.error) throw messagesRes.error

      const moods = moodsRes.data || []
      const latestByPerson = {}
      for (const mood of moods) {
        if (!latestByPerson[mood.person]) latestByPerson[mood.person] = mood
      }

      if (hasPerson) {
        setMyMood(latestByPerson[person] || null)
        setPartnerMood(latestByPerson[getOtherPerson(person)] || null)
        setMessages((messagesRes.data || []).filter((m) => m.person !== person).slice(0, 5))
      } else {
        setMyMood(null)
        setPartnerMood(null)
        setMessages((messagesRes.data || []).slice(0, 5))
      }
    } catch (err) {
      console.error(err)
      setFailed(true)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [hasPerson, person, showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!isSupabaseConfigured || failed) return <ConnectionError />
  if (loading) return <Loading label="Loading your space..." />

  return (
    <div className="page dashboard fade-in">
      <header className="page-header">
        <p className="date-line">{formatTodayLong()}</p>
        {hasPerson ? (
          <>
            <h1>
              {getGreeting(personName)} <span aria-hidden="true">❤️</span>
            </h1>
            <p className="lede">How are you today?</p>
            <button type="button" className="btn btn--ghost btn--sm switch-btn" onClick={switchPerson}>
              Switch person
            </button>
          </>
        ) : (
          <>
            <h1>
              Welcome to {APP_NAME} <span aria-hidden="true">❤️</span>
            </h1>
            <p className="lede">Choose who you are</p>
          </>
        )}
      </header>

      {!hasPerson ? <PersonPicker /> : null}

      {messages.length > 0 && (
        <section className="notifications">
          <h2>Recent messages</h2>
          <ul>
            {messages.map((msg) => (
              <li key={msg.id} className="notification-item">
                <div>
                  <p>{msg.message}</p>
                  <span className="muted">
                    {getPersonName(msg.person)} · {formatRelativeTime(msg.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mood-grid">
        <MoodCard
          title={hasPerson ? 'You' : getPersonName('kamu')}
          mood={hasPerson ? myMood : null}
          emptyText={hasPerson ? "You haven't shared your mood today." : 'No mood yet.'}
        />
        <MoodCard
          title={hasPerson ? getPersonName(getOtherPerson(person)) : getPersonName('dia')}
          mood={hasPerson ? partnerMood : null}
          emptyText="No mood shared yet."
          hint={hasPerson && partnerMood ? getMoodHint(partnerMood.mood_key) : null}
        />
      </section>

      {hasPerson && myMood ? (
        <p className="current-mood-line">
          <span aria-hidden="true">{myMood.mood_emoji}</span> {myMood.mood_label}
        </p>
      ) : null}

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions__grid">
          <Link to="/mood" className="action-btn">
            Mood
          </Link>
          <Link to="/notes" className="action-btn">
            Notes
          </Link>
          <Link to="/things-to-do" className="action-btn">
            Things To Do
          </Link>
          <Link to="/memories" className="action-btn">
            Memories
          </Link>
        </div>
        <Link to="/date-ideas" className="btn btn--primary btn--block surprise-btn">
          🎲 Surprise Me
        </Link>
      </section>

      <QuickMessage onSent={loadData} />
    </div>
  )
}
