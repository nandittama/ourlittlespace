import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getJakartaDateString } from '../utils/date'

export function useSpaceData(enabled = true) {
  const [moods, setMoods] = useState([])
  const [notes, setNotes] = useState([])
  const [reactions, setReactions] = useState([])
  const [memories, setMemories] = useState([])
  const [bucketItems, setBucketItems] = useState([])
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }
    if (!isSupabaseConfigured) {
      setError(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)
    try {
      const today = getJakartaDateString()
      const [moodsRes, notesRes, reactionsRes, memoriesRes, bucketRes, lettersRes] =
        await Promise.all([
          supabase
            .from('moods')
            .select('id,person,mood_key,mood_emoji,mood_label,message,mood_date,created_at,updated_at')
            .eq('mood_date', today),
          supabase
            .from('notes')
            .select('id,sender,receiver,content,is_read,created_at')
            .order('created_at', { ascending: false })
            .limit(30),
          supabase
            .from('note_reactions')
            .select('id,note_id,person,reaction_type,created_at'),
          supabase
            .from('memories')
            .select('id,person,title,description,image_url,memory_date,created_at')
            .order('memory_date', { ascending: false })
            .limit(24),
          supabase
            .from('bucket_items')
            .select('id,title,status,created_by,completed_date,created_at')
            .order('created_at', { ascending: false })
            .limit(40),
          supabase
            .from('secret_letters')
            .select('id,sender,receiver,content,open_on,created_at')
            .order('created_at', { ascending: false })
            .limit(20),
        ])

      for (const res of [moodsRes, notesRes, reactionsRes, memoriesRes, bucketRes, lettersRes]) {
        if (res.error) throw res.error
      }

      setMoods(moodsRes.data || [])
      setNotes(notesRes.data || [])
      setReactions(reactionsRes.data || [])
      setMemories(memoriesRes.data || [])
      setBucketItems(bucketRes.data || [])
      setLetters(lettersRes.data || [])
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    refresh()
  }, [refresh])

  const latestMoodByPerson = (personKey) =>
    moods.find((m) => m.person === personKey) || null

  const reactionsForNote = (noteId) => reactions.filter((r) => r.note_id === noteId)

  return {
    moods,
    notes,
    reactions,
    memories,
    bucketItems,
    letters,
    loading,
    error,
    refresh,
    latestMoodByPerson,
    reactionsForNote,
  }
}
