import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import { getGreeting, formatTodayLong, formatRelativeTime } from '../utils/date'
import { getOtherPerson, getPersonName } from '../config'
import { getMoodHint } from '../utils/moods'
import MoodCard from '../components/MoodCard'
import QuickMessage from '../components/QuickMessage'
import ConnectionError from '../components/ConnectionError'
import Loading from '../components/Loading'

export default function Dashboard() {
  const { person, personName } = usePerson()
  const { showToast } = useToast()
  const [myMood, setMyMood] = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  const [messages, setMessages] = useState([])
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

      setMyMood(latestByPerson[person] || null)
      setPartnerMood(latestByPerson[getOtherPerson(person)] || null)
      setMessages((messagesRes.data || []).filter((m) => m.person !== person).slice(0, 5))
    } catch (err) {
      console.error(err)
      setFailed(true)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [person, showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!isSupabaseConfigured || failed) return <ConnectionError />
  if (loading) return <Loading label="Loading your space..." />

  return (
    <div className="page dashboard fade-in">
      <header className="page-header">
        <p className="date-line">{formatTodayLong()}</p>
        <h1>
          {getGreeting(personName)} <span aria-hidden="true">❤️</span>
        </h1>
        <p className="lede">How are you today?</p>
      </header>

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
          title="You"
          mood={myMood}
          emptyText="You haven't shared your mood today."
        />
        <MoodCard
          title={getPersonName(getOtherPerson(person))}
          mood={partnerMood}
          emptyText="No mood shared yet."
          hint={partnerMood ? getMoodHint(partnerMood.mood_key) : null}
        />
      </section>

      {myMood ? (
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
      </section>

      <QuickMessage onSent={loadData} />
    </div>
  )
}
