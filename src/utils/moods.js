export const MOODS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'loved', emoji: '🥰', label: 'Loved' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'sad', emoji: '😔', label: 'Sad' },
  { key: 'angry', emoji: '😡', label: 'Angry' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'need_you', emoji: '🤍', label: 'Need You' },
]

export function getMoodByKey(key) {
  return MOODS.find((m) => m.key === key) || null
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
