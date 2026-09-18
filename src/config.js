export const PERSON_ONE = 'kamu'
export const PERSON_TWO = 'dia'

/** Default names — can be overridden in localStorage */
export const DEFAULT_PERSON_ONE_NAME = 'Nadhif'
export const DEFAULT_PERSON_TWO_NAME = 'Diah'

export const STORAGE_KEY_PERSON = 'current_person'
export const STORAGE_KEY_NAME_ONE = 'display_name_kamu'
export const STORAGE_KEY_NAME_TWO = 'display_name_dia'

export function readStoredName(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    if (value && value.trim()) return value.trim()
  } catch {
    /* ignore */
  }
  return fallback
}

export function getPersonName(personKey) {
  if (personKey === PERSON_ONE) {
    return readStoredName(STORAGE_KEY_NAME_ONE, DEFAULT_PERSON_ONE_NAME)
  }
  if (personKey === PERSON_TWO) {
    return readStoredName(STORAGE_KEY_NAME_TWO, DEFAULT_PERSON_TWO_NAME)
  }
  return 'Someone'
}

export function getPersons() {
  return [
    { key: PERSON_ONE, name: getPersonName(PERSON_ONE) },
    { key: PERSON_TWO, name: getPersonName(PERSON_TWO) },
  ]
}

export function getOtherPerson(key) {
  return key === PERSON_ONE ? PERSON_TWO : PERSON_ONE
}

export const APP_NAME = 'Our Little Space'
export const APP_TAGLINE = 'A little place for us.'

// Back-compat aliases used by older imports during refactor
export const PERSON_ONE_NAME = DEFAULT_PERSON_ONE_NAME
export const PERSON_TWO_NAME = DEFAULT_PERSON_TWO_NAME
export const PERSONS = [
  { key: PERSON_ONE, name: DEFAULT_PERSON_ONE_NAME },
  { key: PERSON_TWO, name: DEFAULT_PERSON_TWO_NAME },
]
