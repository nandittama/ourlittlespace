import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  PERSON_ONE,
  PERSON_TWO,
  STORAGE_KEY_PERSON,
  getPersonName,
  getPersons,
  getOtherPerson,
  normalizePerson,
} from '../config'

const PersonContext = createContext(null)

function readPerson() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERSON)
    const normalized = normalizePerson(raw)
    if (normalized) {
      if (raw !== normalized) localStorage.setItem(STORAGE_KEY_PERSON, normalized)
      return normalized
    }
  } catch {
    /* ignore */
  }
  return null
}

export function PersonProvider({ children }) {
  const [person, setPersonState] = useState(() => readPerson())
  const [pickerOpen, setPickerOpen] = useState(() => !readPerson())

  useEffect(() => {
    if (!person) setPickerOpen(true)
  }, [person])

  const setPerson = useCallback((next) => {
    const normalized = normalizePerson(next)
    if (!normalized) return
    setPersonState(normalized)
    try {
      localStorage.setItem(STORAGE_KEY_PERSON, normalized)
    } catch {
      /* ignore */
    }
  }, [])

  const switchPerson = useCallback(() => {
    if (!person) {
      setPickerOpen(true)
      return
    }
    setPerson(getOtherPerson(person))
  }, [person, setPerson])

  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => {
    if (!person) return
    setPickerOpen(false)
  }, [person])

  const value = useMemo(
    () => ({
      person,
      personName: person ? getPersonName(person) : null,
      partnerKey: person ? getOtherPerson(person) : null,
      partnerName: person ? getPersonName(getOtherPerson(person)) : null,
      persons: getPersons(),
      hasPerson: Boolean(person),
      setPerson,
      switchPerson,
      pickerOpen,
      openPicker,
      closePicker,
      PERSON_ONE,
      PERSON_TWO,
    }),
    [person, setPerson, switchPerson, pickerOpen, openPicker, closePicker]
  )

  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>
}

export function usePerson() {
  const ctx = useContext(PersonContext)
  if (!ctx) throw new Error('usePerson must be used within PersonProvider')
  return ctx
}
