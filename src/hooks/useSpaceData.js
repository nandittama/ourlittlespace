import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getJakartaDateString } from '../utils/date'

async function safeQuery(label, runner) {
  try {
    const res = await runner()
    if (res.error) {
      console.error(`[${label}]`, res.error)
      return { data: null, error: res.error }
    }
    return { data: res.data || [], error: null }
  } catch (err) {
    console.error(`[${label}]`, err)
    return { data: null, error: err }
  }
}

export function useSpaceData(enabled = true) {
  const [moods, setMoods] = useState([])
  const [notes, setNotes] = useState([])
  const [reactions, setReactions] = useState([])
  const [memories, setMemories] = useState([])
  const [bucketItems, setBucketItems] = useState([])
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState(false)
  const hasLoadedRef = useRef(false)

  const refresh = useCallback(async (opts = {}) => {
    const silent = opts.silent === true
    if (!enabled) {
      setLoading(false)
      return
    }
    if (!isSupabaseConfigured) {
      setError(true)
      setLoading(false)
      return
    }

    // Skeleton hanya di load pertama — refresh setelah aksi jangan unmount halaman
    if (!silent && !hasLoadedRef.current) setLoading(true)
    setError(false)
    try {
      const today = getJakartaDateString()

      const [moodsRes, notesRes, reactionsRes, memoriesRes, bucketRes, lettersRes] =
        await Promise.all([
          safeQuery('moods', () =>
            supabase
              .from('moods')
              .select(
                'id,person,mood_key,mood_emoji,mood_label,message,mood_date,created_at,updated_at'
              )
              .eq('mood_date', today)
          ),
          safeQuery('notes', () =>
            supabase
              .from('notes')
              .select('id,sender,receiver,content,is_read,created_at')
              .order('created_at', { ascending: false })
              .limit(30)
          ),
          safeQuery('note_reactions', () =>
            supabase
              .from('note_reactions')
              .select('id,note_id,person,reaction_type,created_at')
          ),
          safeQuery('memories', () =>
            supabase
              .from('memories')
              .select('id,person,title,description,image_url,memory_date,created_at')
              .order('memory_date', { ascending: false })
              .limit(24)
          ),
          safeQuery('bucket_items', () =>
            supabase
              .from('bucket_items')
              .select('id,title,status,created_by,completed_date,created_at')
              .order('created_at', { ascending: false })
              .limit(40)
          ),
          safeQuery('secret_letters', () =>
            supabase
              .from('secret_letters')
              .select('id,sender,receiver,content,open_on,created_at')
              .order('created_at', { ascending: false })
              .limit(20)
          ),
        ])

      let notesData = notesRes.data
      if (notesRes.error) {
        const legacy = await safeQuery('notes_legacy', () =>
          supabase
            .from('notes')
            .select('id,person,content,created_at')
            .order('created_at', { ascending: false })
            .limit(30)
        )
        if (legacy.data) {
          notesData = legacy.data.map((n) => ({
            id: n.id,
            sender: n.person === 'dia' || n.person === 'diah' ? 'diah' : 'nadhif',
            receiver: n.person === 'dia' || n.person === 'diah' ? 'nadhif' : 'diah',
            content: n.content,
            is_read: false,
            created_at: n.created_at,
          }))
        }
      }

      let moodsData = moodsRes.data
      if (moodsRes.error) {
        const legacy = await safeQuery('moods_legacy', () =>
          supabase
            .from('moods')
            .select('id,person,mood_key,mood_emoji,mood_label,message,created_at')
            .order('created_at', { ascending: false })
            .limit(20)
        )
        if (legacy.data) {
          moodsData = legacy.data
            .map((m) => ({
              ...m,
              person:
                m.person === 'dia' || m.person === 'diah'
                  ? 'diah'
                  : m.person === 'kamu' || m.person === 'nadhif'
                    ? 'nadhif'
                    : m.person,
              mood_date: getJakartaDateString(new Date(m.created_at)),
              updated_at: m.created_at,
            }))
            .filter((m) => m.mood_date === today)
        }
      }

      const criticalFailed = Boolean(
        (moodsRes.error && !moodsData) || (notesRes.error && !notesData) || memoriesRes.error
      )

      setMoods(moodsData || [])
      setNotes(notesData || [])
      setReactions(reactionsRes.data || [])
      setMemories(memoriesRes.data || [])
      setBucketItems(bucketRes.data || [])
      setLetters(lettersRes.data || [])
      setError(criticalFailed)
      hasLoadedRef.current = true
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

  const patchBucketItem = useCallback((id, patch) => {
    setBucketItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

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
    patchBucketItem,
    latestMoodByPerson,
    reactionsForNote,
  }
}
