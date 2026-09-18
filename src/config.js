/** Easy-to-edit names for both people */
export const PERSON_ONE_NAME = 'Nadhif'
export const PERSON_TWO_NAME = 'Diah'

/** Internal keys stored in DB + localStorage */
export const PERSON_ONE = 'kamu'
export const PERSON_TWO = 'dia'

/** Default PINs (overridden by localStorage after change) */
export const DEFAULT_PINS = {
  [PERSON_ONE]: '2104', // Nadhif
  [PERSON_TWO]: '0421', // Diah
}

export const PERSONS = [
  { key: PERSON_ONE, name: PERSON_ONE_NAME, pinKey: 'pin_nadhif', tag: 'Hubby' },
  { key: PERSON_TWO, name: PERSON_TWO_NAME, pinKey: 'pin_diah', tag: 'Wifey' },
]

export function getPersonName(key) {
  if (key === PERSON_ONE) return PERSON_ONE_NAME
  if (key === PERSON_TWO) return PERSON_TWO_NAME
  return 'Someone'
}

export function getOtherPerson(key) {
  return key === PERSON_ONE ? PERSON_TWO : PERSON_ONE
}

export function getPersonConfig(key) {
  return PERSONS.find((p) => p.key === key) || null
}

export const APP_NAME = 'Our Little Space'
export const STORAGE_KEY_PERSON = 'current_person'
export const STORAGE_KEY_LOGGED_IN = 'is_logged_in'
export const STORAGE_KEY_BATTERY = 'social_battery'

/**
 * Development shortcut:
 * true  = skip PIN login, open as Nadhif
 * false = normal PIN login
 */
export const DISABLE_LOGIN = true
export const DEV_AUTO_PERSON = PERSON_ONE // Nadhif

/** Relationship / ambience (edit freely) */
export const RELATIONSHIP_START = '2026-09-04' // YYYY-MM-DD
export const SPACE_LOCATION = 'Together'
export const SPACE_WEATHER = 'Warm day'
export const PARTNER_ROLE_TAG = {
  [PERSON_ONE]: 'Hubby',
  [PERSON_TWO]: 'Wifey',
}
