import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  PERSON_ONE,
  PERSON_TWO,
  STORAGE_KEY_PERSON,
  STORAGE_KEY_NAME_ONE,
  STORAGE_KEY_NAME_TWO,
  DEFAULT_PERSON_ONE_NAME,
  DEFAULT_PERSON_TWO_NAME,
  getPersonName,
  getPersons,
} from '../config'

const PersonContext = createContext(null)

function readPerson() {
  try {
    const value = localStorage.getItem(STORAGE_KEY_PERSON)
    if (value === PERSON_ONE || value === PERSON_TWO) return value
  } catch {
    /* ignore */
  }
  return null
}

export function PersonProvider({ children }) {
  const [person, setPersonState] = useState(() => readPerson())
  const [namesVersion, setNamesVersion] = useState(0)

  const setPerson = useCallback((next) => {
    if (next !== PERSON_ONE && next !== PERSON_TWO) return
    setPersonState(next)
    try {
      localStorage.setItem(STORAGE_KEY_PERSON, next)
    } catch {
      /* ignore */
    }
  }, [])

  const switchPerson = useCallback(() => {
    if (!person) return
    setPerson(person === PERSON_ONE ? PERSON_TWO : PERSON_ONE)
  }, [person, setPerson])

  const clearPerson = useCallback(() => {
    setPersonState(null)
    try {
      localStorage.removeItem(STORAGE_KEY_PERSON)
    } catch {
      /* ignore */
    }
  }, [])

  const updateNames = useCallback((nameOne, nameTwo) => {
    try {
      localStorage.setItem(STORAGE_KEY_NAME_ONE, nameOne.trim() || DEFAULT_PERSON_ONE_NAME)
      localStorage.setItem(STORAGE_KEY_NAME_TWO, nameTwo.trim() || DEFAULT_PERSON_TWO_NAME)
      setNamesVersion((v) => v + 1)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => {
    void namesVersion
    return {
      person,
      personName: person ? getPersonName(person) : null,
      persons: getPersons(),
      hasPerson: Boolean(person),
      setPerson,
      switchPerson,
      clearPerson,
      updateNames,
    }
  }, [person, namesVersion, setPerson, switchPerson, clearPerson, updateNames])

  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>
}

export function usePerson() {
  const ctx = useContext(PersonContext)
  if (!ctx) throw new Error('usePerson must be used within PersonProvider')
  return ctx
}
