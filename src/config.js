/** Central couple configuration — edit here only */
export const COUPLE_CONFIG = {
  personOne: 'Nadhif',
  personTwo: 'Diah',
  anniversaryDate: '2026-09-04',
  timezone: 'Asia/Jakarta',
  relationshipVibe: 'Cozy & In Love',
  /** Nomor WA tanpa + / spasi, format lokal OK (08...) */
  whatsappNumber: '082154549026',
}

export const PERSON_ONE = 'nadhif'
export const PERSON_TWO = 'diah'
export const PERSON_ONE_NAME = COUPLE_CONFIG.personOne
export const PERSON_TWO_NAME = COUPLE_CONFIG.personTwo
export const STORAGE_KEY_PERSON = 'current_person'
export const ANNIVERSARY_DATE = COUPLE_CONFIG.anniversaryDate
export const RELATIONSHIP_VIBE = COUPLE_CONFIG.relationshipVibe
export const TIMEZONE = COUPLE_CONFIG.timezone
export const WHATSAPP_NUMBER = COUPLE_CONFIG.whatsappNumber

/** Build https://wa.me/62... from local ID number */
export function getWhatsAppUrl(localNumber = WHATSAPP_NUMBER) {
  const digits = String(localNumber || '').replace(/\D/g, '')
  const intl = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${intl}`
}

export const APP_NAME = 'Our Little Space'
export const APP_TAGLINE = 'Ruang kecil milik kita berdua.'
export const APP_SUBTITLE = 'Ruang Cinta Nadhif & Diah'

/**
 * Spotify playlist — boleh paste link biasa ATAU embed.
 * Contoh biasa: https://open.spotify.com/playlist/xxxxx
 * Contoh embed: https://open.spotify.com/embed/playlist/xxxxx
 */
export const SPOTIFY_PLAYLIST_URL =
  'https://open.spotify.com/playlist/0qp6l8oRyyoNQdrnFldyJe'

/** Convert open.spotify.com links → embeddable iframe src */
export function getSpotifyEmbedUrl(url) {
  if (!url) return ''
  try {
    const u = new URL(url.trim())
    // already embed
    if (u.pathname.includes('/embed/')) {
      u.search = 'utm_source=generator'
      return u.toString()
    }
    // /playlist/ID or /album/ID or /track/ID
    const match = u.pathname.match(/^\/(playlist|album|track)\/([a-zA-Z0-9]+)/)
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`
    }
  } catch {
    /* ignore */
  }
  return url
}

// back-compat
export const SPOTIFY_PLAYLIST_EMBED = getSpotifyEmbedUrl(SPOTIFY_PLAYLIST_URL)

export const DAILY_QUOTES = [
  'Cinta tumbuh dari hal-hal kecil yang dilakukan bersama.',
  'Dalam momen yang sederhana, kita menemukan rumah.',
  'Dua hati, satu ruang kecil yang tenang.',
  'Cerita terbaik ditulis pelan-pelan, berdampingan.',
  'Bukan tentang sempurna — tentang hadir untuk satu sama lain.',
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
