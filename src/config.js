/** Easy-to-edit names for both people */
export const PERSON_ONE_NAME = 'Nadhif'
export const PERSON_TWO_NAME = 'Nama Pacar'

/** Internal keys stored in DB + localStorage */
export const PERSON_ONE = 'kamu'
export const PERSON_TWO = 'dia'

export const PERSONS = [
  { key: PERSON_ONE, name: PERSON_ONE_NAME },
  { key: PERSON_TWO, name: PERSON_TWO_NAME },
]

export function getPersonName(key) {
  if (key === PERSON_ONE) return PERSON_ONE_NAME
  if (key === PERSON_TWO) return PERSON_TWO_NAME
  return 'Someone'
}

export function getOtherPerson(key) {
  return key === PERSON_ONE ? PERSON_TWO : PERSON_ONE
}

export const APP_NAME = 'Our Little Space'
export const STORAGE_KEY_PERSON = 'current_person'
