export const MOODS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'loved', emoji: '🥰', label: 'Loved' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'busy', emoji: '⚡', label: 'Busy' },
  { key: 'sad', emoji: '😔', label: 'Sad' },
  { key: 'angry', emoji: '😡', label: 'Angry' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'need_you', emoji: '🤍', label: 'Need You' },
]

/** Quick mood chips on dashboard */
export const DASHBOARD_MOODS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'loved', emoji: '🥰', label: 'Loved' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'busy', emoji: '⚡', label: 'Busy' },
]

export function getMoodByKey(key) {
  return MOODS.find((m) => m.key === key) || null
}

export function getMoodDisplay(mood) {
  if (!mood) return null
  const meta = getMoodByKey(mood.mood_key)
  return {
    emoji: mood.mood_emoji || meta?.emoji || '😊',
    label: mood.mood_label || meta?.label || 'Mood',
  }
}

export function getMoodHint(key) {
  if (key === 'sad' || key === 'angry' || key === 'need_you') {
    return 'Maybe check on them.'
  }
  if (key === 'tired') {
    return 'They might need some rest.'
  }
  return null
}
