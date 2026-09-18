import { usePerson } from '../context/PersonContext'
import { getOtherPerson } from '../config'
import { useSpaceData } from '../hooks/useSpaceData'
import { isSupabaseConfigured } from '../lib/supabase'
import ConnectionError from '../components/ConnectionError'
import PersonPickerModal from '../components/PersonPickerModal'
import HeroSection from '../components/sections/HeroSection'
import MoodSection from '../components/sections/MoodSection'
import TodaySection from '../components/sections/TodaySection'
import NotesSection from '../components/sections/NotesSection'
import TodoSection from '../components/sections/TodoSection'
import DateIdeaSection from '../components/sections/DateIdeaSection'
import MemoriesSection from '../components/sections/MemoriesSection'
import QuickMessagesSection from '../components/sections/QuickMessagesSection'
import FooterSection from '../components/sections/FooterSection'

export default function Home() {
  const { person, hasPerson } = usePerson()
  const {
    notes,
    todos,
    memories,
    loading,
    error,
    refresh,
    latestMoodByPerson,
  } = useSpaceData(hasPerson)

  if (!isSupabaseConfigured) return <ConnectionError />

  if (hasPerson && error) {
    return (
      <div className="connection-error">
        <h1>Something went wrong. Please try again.</h1>
        <button type="button" className="btn btn--primary" onClick={refresh}>
          Try again
        </button>
        <PersonPickerModal />
      </div>
    )
  }

  const myMood = latestMoodByPerson(person)
  const partnerMood = latestMoodByPerson(getOtherPerson(person))
  const latestNote = notes[0] || null
  const activeTodo = todos.find((t) => !t.is_completed) || null

  return (
    <div className="page-shell">
      <HeroSection />

      {hasPerson ? (
        loading ? (
          <div className="skeleton-wrap" aria-busy="true" aria-label="Loading">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          <>
            <MoodSection myMood={myMood} partnerMood={partnerMood} onChanged={refresh} />
            <TodaySection
              myMood={myMood}
              partnerMood={partnerMood}
              latestNote={latestNote}
              activeTodo={activeTodo}
            />
            <NotesSection notes={notes} onChanged={refresh} />
            <TodoSection todos={todos} onChanged={refresh} />
            <DateIdeaSection />
            <MemoriesSection memories={memories} onChanged={refresh} />
            <QuickMessagesSection onChanged={refresh} />
          </>
        )
      ) : null}

      <FooterSection />
      <PersonPickerModal />
    </div>
  )
}
