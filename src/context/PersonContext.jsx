import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  PERSON_ONE,
  PERSON_TWO,
  STORAGE_KEY_PERSON,
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
  const [pickerOpen, setPickerOpen] = useState(() => !readPerson())

  useEffect(() => {
    if (!person) setPickerOpen(true)
  }, [person])

  const setPerson = useCallback((next) => {
    if (next !== PERSON_ONE && next !== PERSON_TWO) return
    setPersonState(next)
    try {
      localStorage.setItem(STORAGE_KEY_PERSON, next)
    } catch {
      /* ignore */
    }
  }, [])

  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => {
    if (!person) return
    setPickerOpen(false)
  }, [person])

  const value = useMemo(
    () => ({
      person,
      personName: person ? getPersonName(person) : null,
      persons: getPersons(),
      hasPerson: Boolean(person),
      setPerson,
      pickerOpen,
      openPicker,
      closePicker,
    }),
    [person, setPerson, pickerOpen, openPicker, closePicker]
  )

  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>
}

export function usePerson() {
  const ctx = useContext(PersonContext)
  if (!ctx) throw new Error('usePerson must be used within PersonProvider')
  return ctx
}
