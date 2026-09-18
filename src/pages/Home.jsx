import { useRef } from 'react'
import { usePerson } from '../context/PersonContext'
import { PERSON_ONE, PERSON_TWO, COUNTDOWNS } from '../config'
import { useSpaceData } from '../hooks/useSpaceData'
import { isSupabaseConfigured } from '../lib/supabase'
import { daysUntil } from '../utils/date'
import ConnectionError from '../components/ConnectionError'
import PersonPickerModal from '../components/PersonPickerModal'
import HeroSection from '../components/sections/HeroSection'
import TodaySection from '../components/sections/TodaySection'
import QuickActionsSection from '../components/sections/QuickActionsSection'
import MoodSection from '../components/sections/MoodSection'
import NotesSection from '../components/sections/NotesSection'
import TimelineSection from '../components/sections/TimelineSection'
import MemoriesSection from '../components/sections/MemoriesSection'
import MusicSection from '../components/sections/MusicSection'
import CountdownSection from '../components/sections/CountdownSection'
import BucketListSection from '../components/sections/BucketListSection'
import DailyQuoteSection from '../components/sections/DailyQuoteSection'
import SecretMailboxSection from '../components/sections/SecretMailboxSection'
import FooterSection from '../components/sections/FooterSection'

export default function Home() {
  const { person, hasPerson } = usePerson()
  const memoriesRef = useRef(null)
  const musicRef = useRef(null)
  const {
    notes,
    reactions,
    memories,
    bucketItems,
    letters,
    loading,
    error,
    refresh,
    latestMoodByPerson,
  } = useSpaceData(hasPerson)

  if (!isSupabaseConfigured) return <ConnectionError />

  if (hasPerson && error) {
    return (
      <div className="page-shell">
        <HeroSection myMood={null} partnerMood={null} />
        <div className="connection-error" style={{ minHeight: '40vh' }}>
          <h1>Ada yang kurang beres 🤍</h1>
          <p className="muted">Coba lagi sebentar ya.</p>
          <button type="button" className="btn btn--primary" onClick={refresh}>
            Coba lagi
          </button>
        </div>
        <FooterSection />
        <PersonPickerModal />
      </div>
    )
  }

  const moodOne = latestMoodByPerson(PERSON_ONE)
  const moodTwo = latestMoodByPerson(PERSON_TWO)
  const myMood = hasPerson ? latestMoodByPerson(person) : null
  const partnerMood = hasPerson
    ? latestMoodByPerson(person === PERSON_ONE ? PERSON_TWO : PERSON_ONE)
    : null
  const nextCountdown = COUNTDOWNS.map((c) => ({ ...c, daysLeft: daysUntil(c.targetDate) }))
    .filter((c) => c.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0]

  return (
    <div className="page-shell">
      <HeroSection myMood={myMood} partnerMood={partnerMood} />

      {hasPerson ? (
        loading ? (
          <div className="skeleton-wrap" aria-busy="true" aria-label="Memuat">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          <>
            <TodaySection
              moodOne={moodOne}
              moodTwo={moodTwo}
              notes={notes}
              nextCountdown={nextCountdown}
            />
            <QuickActionsSection
              onOpenMemory={() => memoriesRef.current?.openUpload?.()}
              onToggleMusic={() => musicRef.current?.togglePlay?.()}
            />
            <MoodSection moodOne={moodOne} moodTwo={moodTwo} onChanged={refresh} />
            <NotesSection notes={notes} reactions={reactions} onChanged={refresh} />
            <TimelineSection />
            <MemoriesSection ref={memoriesRef} memories={memories} onChanged={refresh} />
            <MusicSection ref={musicRef} />
            <CountdownSection />
            <BucketListSection items={bucketItems} onChanged={refresh} />
            <DailyQuoteSection />
            <SecretMailboxSection letters={letters} onChanged={refresh} />
          </>
        )
      ) : null}

      <FooterSection />
      <PersonPickerModal />
    </div>
  )
}
