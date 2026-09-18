import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getJakartaDateString } from '../utils/date'

export function useSpaceData(enabled = true) {
  const [moods, setMoods] = useState([])
  const [notes, setNotes] = useState([])
  const [todos, setTodos] = useState([])
  const [memories, setMemories] = useState([])
  const [messages, setMessages] = useState([])
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
      const [moodsRes, notesRes, todosRes, memoriesRes, messagesRes] = await Promise.all([
        supabase
          .from('moods')
          .select('id,person,mood_key,mood_emoji,mood_label,message,mood_date,created_at,updated_at')
          .eq('mood_date', today)
          .order('updated_at', { ascending: false }),
        supabase
          .from('notes')
          .select('id,person,content,created_at')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('todo_items')
          .select('id,person,title,is_completed,completed_at,created_at')
          .order('created_at', { ascending: false })
          .limit(40),
        supabase
          .from('memories')
          .select('id,person,title,description,image_url,memory_date,created_at')
          .order('memory_date', { ascending: false })
          .limit(24),
        supabase
          .from('quick_messages')
          .select('id,person,type,message,created_at')
          .order('created_at', { ascending: false })
          .limit(12),
      ])

      for (const res of [moodsRes, notesRes, todosRes, memoriesRes, messagesRes]) {
        if (res.error) throw res.error
      }

      setMoods(moodsRes.data || [])
      setNotes(notesRes.data || [])
      setTodos(todosRes.data || [])
      setMemories(memoriesRes.data || [])
      setMessages(messagesRes.data || [])
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

  return {
    moods,
    notes,
    todos,
    memories,
    messages,
    loading,
    error,
    refresh,
    latestMoodByPerson,
  }
}
