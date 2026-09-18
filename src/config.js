/** Central couple configuration — edit here only */
export const COUPLE_CONFIG = {
  personOne: 'Nadhif',
  personTwo: 'Diah',
  anniversaryDate: '2024-05-30',
  timezone: 'Asia/Jakarta',
  relationshipVibe: 'Cozy & In Love',
}

export const PERSON_ONE = 'nadhif'
export const PERSON_TWO = 'diah'
export const PERSON_ONE_NAME = COUPLE_CONFIG.personOne
export const PERSON_TWO_NAME = COUPLE_CONFIG.personTwo
export const STORAGE_KEY_PERSON = 'current_person'
export const ANNIVERSARY_DATE = COUPLE_CONFIG.anniversaryDate
export const RELATIONSHIP_VIBE = COUPLE_CONFIG.relationshipVibe
export const TIMEZONE = COUPLE_CONFIG.timezone

export const APP_NAME = 'Our Little Space'
export const APP_TAGLINE = 'Ruang kecil milik kita berdua.'
export const APP_SUBTITLE = 'Ruang Cinta Nadhif & Diah'

export const COUNTDOWNS = [
  {
    id: 'trip',
    label: 'Next Little Adventure',
    title: 'Jogja',
    emoji: '✈️',
    targetDate: '2026-10-02',
    kind: 'once',
  },
  {
    id: 'years3',
    label: 'Our Next Anniversary',
    title: '3 Years Together',
    emoji: '❤️',
    targetDate: '2027-05-30',
    kind: 'anniversary',
  },
]

export const OUR_SONG = {
  title: 'Kita Bikin Romantis',
  artist: "MALIQ & D'Essentials",
  label: 'Our Song',
  src: '/audio/our-song.mp3',
  artwork: '/audio/our-song-cover.jpg',
}

export const DAILY_QUOTES = [
  'Cinta tumbuh dari hal-hal kecil yang dilakukan bersama.',
  'Dalam momen yang sederhana, kita menemukan rumah.',
  'Dua hati, satu ruang kecil yang tenang.',
  'Cerita terbaik ditulis pelan-pelan, berdampingan.',
  'Bukan tentang sempurna — tentang hadir untuk satu sama lain.',
]

/** Static timeline — Our Story (no admin needed) */
export const TIMELINE_EVENTS = [
  {
    id: 'begin',
    date: '2024-05-30',
    title: 'The Beginning',
    description: 'Di sini cerita kecil kita dimulai.',
  },
  {
    id: 'rain',
    date: '2024-07-15',
    title: 'Our First Trip',
    description: 'Hari itu kita kehujanan — dan tetap tertawa.',
  },
  {
    id: 'christmas',
    date: '2024-12-24',
    title: 'Christmas Together',
    description: 'Natal pertama yang kita rayakan bersama.',
  },
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

export function normalizePerson(value) {
  if (!value) return null
  const v = String(value).toLowerCase()
  if (v === PERSON_ONE || v === 'kamu' || v === 'nadhif') return PERSON_ONE
  if (v === PERSON_TWO || v === 'dia' || v === 'diah') return PERSON_TWO
  return null
}

export const DEFAULT_PERSON_ONE_NAME = PERSON_ONE_NAME
export const DEFAULT_PERSON_TWO_NAME = PERSON_TWO_NAME
export const RELATIONSHIP_START = ANNIVERSARY_DATE
export const PERSONS = getPersons()
