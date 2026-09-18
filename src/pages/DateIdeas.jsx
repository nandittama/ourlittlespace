import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pickRandomIdea } from '../utils/dateIdeas'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'
import PersonPicker from '../components/PersonPicker'
import ConnectionError from '../components/ConnectionError'

export default function DateIdeas() {
  const { person, hasPerson } = usePerson()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [idea, setIdea] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [adding, setAdding] = useState(false)

  if (!isSupabaseConfigured) return <ConnectionError />

  const surprise = () => {
    setSpinning(true)
    setTimeout(() => {
      setIdea(pickRandomIdea(idea?.title))
      setSpinning(false)
    }, 450)
  }

  const addToTodo = async () => {
    if (!idea) return
    if (!hasPerson) {
      showToast('Choose who you are first.', 'error')
      return
    }

    setAdding(true)
    try {
      const { error } = await supabase.from('todo_items').insert({
        title: idea.title,
        person,
      })
      if (error) throw error
      showToast('Added to Things To Do.', 'success')
      navigate('/things-to-do')
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="page date-ideas fade-in">
      <header className="page-header">
        <h1>What should we do?</h1>
        <p className="muted">Pick a simple idea for today.</p>
      </header>

      {!hasPerson ? <PersonPicker compact /> : null}

      <div className="surprise-panel">
        {!idea && !spinning ? (
          <p className="empty-state">Tap the button for an idea.</p>
        ) : null}

        {spinning ? <p className="surprise-loading">Thinking…</p> : null}

        {idea && !spinning ? (
          <div className="surprise-result slide-up" key={idea.title}>
            <p className="surprise-result__label">Tonight&apos;s idea</p>
            <p className="surprise-result__emoji" aria-hidden="true">
              {idea.emoji}
            </p>
            <h2>{idea.title}</h2>
            <p>{idea.detail}</p>
          </div>
        ) : null}

        <button type="button" className="btn btn--primary btn--lg" onClick={surprise} disabled={spinning}>
          🎲 Surprise Me
        </button>

        {idea && !spinning ? (
          <div className="surprise-actions">
            <button type="button" className="btn btn--secondary" onClick={surprise}>
              Try Again
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={adding || !hasPerson}
              onClick={addToTodo}
            >
              {adding ? 'Adding...' : 'Add to Things To Do'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
