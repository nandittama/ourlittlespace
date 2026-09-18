export const PERSON_ONE = 'kamu'
export const PERSON_TWO = 'dia'

export const DEFAULT_PERSON_ONE_NAME = 'Nadhif'
export const DEFAULT_PERSON_TWO_NAME = 'Diah'

export const STORAGE_KEY_PERSON = 'current_person'

export function getPersonName(personKey) {
  if (personKey === PERSON_ONE) return DEFAULT_PERSON_ONE_NAME
  if (personKey === PERSON_TWO) return DEFAULT_PERSON_TWO_NAME
  return 'Someone'
}

export function getPersons() {
  return [
    { key: PERSON_ONE, name: DEFAULT_PERSON_ONE_NAME },
    { key: PERSON_TWO, name: DEFAULT_PERSON_TWO_NAME },
  ]
}

export function getOtherPerson(key) {
  return key === PERSON_ONE ? PERSON_TWO : PERSON_ONE
}

export const APP_NAME = 'Our Little Space'
export const APP_TAGLINE = 'A little place for us.'

export const PERSON_ONE_NAME = DEFAULT_PERSON_ONE_NAME
export const PERSON_TWO_NAME = DEFAULT_PERSON_TWO_NAME
export const PERSONS = [
  { key: PERSON_ONE, name: DEFAULT_PERSON_ONE_NAME },
  { key: PERSON_TWO, name: DEFAULT_PERSON_TWO_NAME },
]
