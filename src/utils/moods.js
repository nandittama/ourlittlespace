export const MOODS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'loved', emoji: '🥰', label: 'Loved' },
  { key: 'okay', emoji: '🙂', label: 'Okay' },
  { key: 'sad', emoji: '🥺', label: 'Sad' },
  { key: 'angry', emoji: '😠', label: 'Angry' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
]

export function getMoodByKey(key) {
  return MOODS.find((m) => m.key === key) || null
}
