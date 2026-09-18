import { useRef } from 'react'
import { usePerson } from '../context/PersonContext'
import { PERSON_ONE, PERSON_TWO } from '../config'
import { useSpaceData } from '../hooks/useSpaceData'
import { isSupabaseConfigured } from '../lib/supabase'
import ConnectionError from '../components/ConnectionError'
import PersonPickerModal from '../components/PersonPickerModal'
import HeroSection from '../components/sections/HeroSection'
import QuickActionsSection from '../components/sections/QuickActionsSection'
import MoodSection from '../components/sections/MoodSection'
import NotesSection from '../components/sections/NotesSection'
import MemoriesSection from '../components/sections/MemoriesSection'
import MusicSection from '../components/sections/MusicSection'
import BucketListSection from '../components/sections/BucketListSection'
import DailyQuoteSection from '../components/sections/DailyQuoteSection'
import SecretMailboxSection from '../components/sections/SecretMailboxSection'
import FooterSection from '../components/sections/FooterSection'

export default function Home() {
  const { hasPerson } = usePerson()
  const memoriesRef = useRef(null)
  const {
    notes,
    reactions,
    memories,
    bucketItems,
    letters,
    loading,
    error,
    refresh,
    patchBucketItem,
    latestMoodByPerson,
  } = useSpaceData(hasPerson)

  const refreshQuiet = () => refresh({ silent: true })

  if (!isSupabaseConfigured) return <ConnectionError />

  if (hasPerson && error) {
    return (
      <div className="page-shell">
        <HeroSection />
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

  return (
    <div className="page-shell">
      <HeroSection />

      {hasPerson ? (
        loading ? (
          <div className="skeleton-wrap" aria-busy="true" aria-label="Memuat">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          <>
            <QuickActionsSection onOpenMemory={() => memoriesRef.current?.openUpload?.()} />
            <MoodSection moodOne={moodOne} moodTwo={moodTwo} onChanged={refreshQuiet} />
            <NotesSection notes={notes} reactions={reactions} onChanged={refreshQuiet} />
            <MemoriesSection ref={memoriesRef} memories={memories} onChanged={refreshQuiet} />
            <MusicSection />
            <BucketListSection
              items={bucketItems}
              onChanged={refreshQuiet}
              onPatchItem={patchBucketItem}
            />
            <DailyQuoteSection />
            <SecretMailboxSection letters={letters} onChanged={refreshQuiet} />
          </>
        )
      ) : null}

      <FooterSection />
      <PersonPickerModal />
    </div>
  )
}
