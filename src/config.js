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

export const APP_NAME = 'ruang kecil'
export const APP_TAGLINE = 'Ruang kecil milik kita berdua.'
export const APP_SUBTITLE = 'ruang kecil'

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

/** Kutipan nyata soal cinta & kehidupan dewasa — diacak per hari (Asia/Jakarta) */
export const DAILY_QUOTES = [
  {
    text: 'Cinta tidak terdiri dari saling menatap, melainkan dari menatap keluar bersama ke arah yang sama.',
    author: 'Antoine de Saint-Exupéry',
  },
  {
    text: 'Hal terbaik untuk dipegang dalam hidup adalah satu sama lain.',
    author: 'Audrey Hepburn',
  },
  {
    text: 'Dicintai dengan dalam memberi kekuatan; mencintai dengan dalam memberi keberanian.',
    author: 'Lao Tzu',
  },
  {
    text: 'Cinta adalah satu jiwa yang menghuni dua tubuh.',
    author: 'Aristoteles',
  },
  {
    text: 'Di mana ada cinta, di situ ada kehidupan.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Apa pun jiwa kita terbuat dari, miliknya dan milikku adalah sama.',
    author: 'Emily Brontë',
  },
  {
    text: 'Aku mencintaimu bukan hanya karena siapa dirimu, tapi karena siapa aku saat bersamamu.',
    author: 'Roy Croft',
  },
  {
    text: 'Kita mencintai dengan cinta yang lebih dari sekadar cinta.',
    author: 'Edgar Allan Poe',
  },
  {
    text: 'Mencintai dan dicintai berarti merasakan matahari dari kedua sisi.',
    author: 'David Viscott',
  },
  {
    text: 'Satu-satunya yang tak pernah cukup kita terima adalah cinta; dan satu-satunya yang tak pernah cukup kita beri adalah cinta.',
    author: 'Henry Miller',
  },
  {
    text: 'Cinta tumbuh pelan-pelan, seperti pohon — bukan seperti rumput yang cepat tapi dangkal.',
    author: 'Antoine de Saint-Exupéry',
  },
  {
    text: 'Dalam pernikahan atau cinta yang matang, yang dicari bukan kesempurnaan, melainkan kebersamaan.',
    author: 'Simone de Beauvoir',
  },
  {
    text: 'Cinta sejati dimulai ketika kamu mengharapkan kebahagiaan orang lain lebih dari kebahagiaanmu sendiri.',
    author: 'Robert Heinlein',
  },
  {
    text: 'Kamu tahu kamu jatuh cinta ketika tak bisa tidur karena kenyataan akhirnya lebih indah dari mimpi.',
    author: 'Dr. Seuss',
  },
  {
    text: 'Aku lebih memilih berbagi satu masa hidup denganmu daripada menghadapi seluruh zaman sendirian.',
    author: 'J.R.R. Tolkien',
  },
  {
    text: 'Cinta adalah keinginan yang tak tertahankan untuk diinginkan tanpa bisa ditolak.',
    author: 'Robert Frost',
  },
  {
    text: 'Hal terbesar yang akan pernah kau pelajari adalah mencintai dan dicintai kembali.',
    author: 'Eden Ahbez',
  },
  {
    text: 'Jatuh cinta itu mudah. Yang sulit adalah membangun cinta yang bertahan.',
    author: 'Anonymous',
  },
  {
    text: 'Cinta adalah persahabatan yang telah terbakar api.',
    author: 'Laura Teresa Marahrens',
  },
  {
    text: 'Rumah bukanlah sebuah tempat; rumah adalah orang yang kau cintai.',
    author: 'Anonymous',
  },
  {
    text: 'Cinta bukan mencari seseorang untuk hidup bersamanya, melainkan menemukan seseorang yang tanpa dia kau tak bisa hidup.',
    author: 'Anonymous',
  },
  {
    text: 'Kedewasaan dalam cinta adalah memilih orang yang sama, berkali-kali, setiap hari.',
    author: 'Anonymous',
  },
  {
    text: 'Yang membuat cinta bertahan bukan api yang besar, melainkan bara yang dijaga.',
    author: 'Anonymous',
  },
  {
    text: 'Cinta yang dewasa tidak menuntut sempurna; ia belajar berdamai dengan yang nyata.',
    author: 'Anonymous',
  },
  {
    text: 'Dua orang tidak saling menemukan; mereka menciptakan satu sama lain.',
    author: 'Thomas Szasz',
  },
  {
    text: 'Cinta adalah ketika kebahagiaan orang lain penting bagi kebahagiaanmu.',
    author: 'H. Jackson Brown Jr.',
  },
  {
    text: 'Jangan jatuh cinta. Bangunlah cinta — pelan, jujur, dan setiap hari.',
    author: 'Anonymous',
  },
  {
    text: 'Cinta yang matang adalah berani tetap lembut setelah banyak belajar tentang rasa sakit.',
    author: 'Anonymous',
  },
  {
    text: 'Keintiman sejati bukan soal selalu bersama, tapi merasa aman saat menjadi diri sendiri.',
    author: 'Anonymous',
  },
  {
    text: 'Cinta adalah memberi seseorang kekuatan untuk menghancurkanmu, dan percaya ia tidak akan melakukannya.',
    author: 'Anonymous',
  },
  {
    text: 'Hubungan yang sehat bukan tanpa konflik, melainkan tahu cara pulih bersama.',
    author: 'Anonymous',
  },
  {
    text: 'Cinta terbaik adalah yang membuatmu ingin menjadi versi terbaik dari dirimu.',
    author: 'Anonymous',
  },
  {
    text: 'Bersamanya, hari biasa terasa cukup.',
    author: 'Anonymous',
  },
  {
    text: 'Cinta yang bertahan adalah cinta yang memilih untuk tetap hadir.',
    author: 'Anonymous',
  },
  {
    text: 'Kita tidak jatuh cinta karena sempurna; kita tetap mencintai karena memilih.',
    author: 'Anonymous',
  },
  {
    text: 'Dalam cinta dewasa, keheningan pun bisa terasa hangat.',
    author: 'Anonymous',
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
