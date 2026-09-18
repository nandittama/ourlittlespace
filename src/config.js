export const PERSON_ONE = 'nadhif'
export const PERSON_TWO = 'diah'

export const PERSON_ONE_NAME = 'Nadhif'
export const PERSON_TWO_NAME = 'Diah'

export const STORAGE_KEY_PERSON = 'current_person'

/** Relationship start / anniversary (Asia/Jakarta business date) */
export const ANNIVERSARY_DATE = '2026-09-04'

export const RELATIONSHIP_VIBE = 'Cozy & In Love'
export const TIMEZONE = 'Asia/Jakarta'

export const APP_NAME = 'Our Little Space'
export const APP_TAGLINE = 'A little space for us.'
export const APP_SUBTITLE = 'Ruang kecil Nadhif & Diah.'

/** Next / named countdowns (editable here) */
export const COUNTDOWNS = [
  {
    id: 'trip',
    label: 'Upcoming Trip',
    title: 'Liburan ke Jogja',
    targetDate: '2026-10-02',
    kind: 'once',
  },
  {
    id: 'years3',
    label: 'Relationship Milestone',
    title: '3 Years Together',
    targetDate: '2027-05-30',
    kind: 'once',
  },
]

/** Our song — put file in /public/audio/ or leave empty */
export const OUR_SONG = {
  title: 'Kita Bikin Romantis',
  artist: "MALIQ & D'Essentials",
  label: 'Our song',
  src: '/audio/our-song.mp3',
  artwork: '/audio/our-song-cover.jpg',
}

export const DAILY_QUOTES = [
  'Cinta bukan tentang mencari orang yang sempurna, melainkan menikmati setiap hal kecil yang sederhana bersamamu.',
  'Cinta tumbuh dari hal-hal kecil yang dilakukan bersama.',
  'In the little moments, we find our biggest home.',
  'Two hearts, one quiet space.',
  'The best stories are written slowly, side by side.',
]

export function getPersonName(personKey) {
  if (personKey === PERSON_ONE || personKey === 'kamu') return PERSON_ONE_NAME
  if (personKey === PERSON_TWO || personKey === 'dia') return PERSON_TWO_NAME
  return 'Someone'
}

export function getPersons() {
  return [
    { key: PERSON_ONE, name: PERSON_ONE_NAME },
    { key: PERSON_TWO, name: PERSON_TWO_NAME },
  ]
}

export function getOtherPerson(key) {
  const normalized = normalizePerson(key)
  return normalized === PERSON_ONE ? PERSON_TWO : PERSON_ONE
}

/** Map legacy keys + names → canonical person id */
export function normalizePerson(value) {
  if (!value) return null
  const v = String(value).toLowerCase()
  if (v === PERSON_ONE || v === 'kamu' || v === 'nadhif') return PERSON_ONE
  if (v === PERSON_TWO || v === 'dia' || v === 'diah') return PERSON_TWO
  return null
}

// Back-compat
export const DEFAULT_PERSON_ONE_NAME = PERSON_ONE_NAME
export const DEFAULT_PERSON_TWO_NAME = PERSON_TWO_NAME
export const RELATIONSHIP_START = ANNIVERSARY_DATE
export const PERSONS = getPersons()
