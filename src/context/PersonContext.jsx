import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  PERSON_ONE,
  PERSON_TWO,
  DEFAULT_PINS,
  STORAGE_KEY_PERSON,
  STORAGE_KEY_LOGGED_IN,
  getPersonName,
  getPersonConfig,
} from '../config'

const PersonContext = createContext(null)

function readStoredPerson() {
  try {
    const value = localStorage.getItem(STORAGE_KEY_PERSON)
    if (value === PERSON_ONE || value === PERSON_TWO) return value
  } catch {
    /* ignore */
  }
  return null
}

function readLoggedIn() {
  try {
    return localStorage.getItem(STORAGE_KEY_LOGGED_IN) === 'true' && Boolean(readStoredPerson())
  } catch {
    return false
  }
}

export function getStoredPin(personKey) {
  const config = getPersonConfig(personKey)
  if (!config) return null
  try {
    const stored = localStorage.getItem(config.pinKey)
    if (stored && /^\d{4,}$/.test(stored)) return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_PINS[personKey]
}

export function PersonProvider({ children }) {
  const [person, setPersonState] = useState(() => (readLoggedIn() ? readStoredPerson() : null))
  const [isLoggedIn, setIsLoggedIn] = useState(() => readLoggedIn())

  const login = useCallback((personKey, pin) => {
    if (personKey !== PERSON_ONE && personKey !== PERSON_TWO) {
      return { ok: false, error: 'Pilih nama dulu.' }
    }
    const expected = getStoredPin(personKey)
    if (String(pin).trim() !== String(expected)) {
      return { ok: false, error: 'PIN salah. Coba lagi.' }
    }

    setPersonState(personKey)
    setIsLoggedIn(true)
    try {
      localStorage.setItem(STORAGE_KEY_PERSON, personKey)
      localStorage.setItem(STORAGE_KEY_LOGGED_IN, 'true')
    } catch {
      /* ignore */
    }
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setPersonState(null)
    setIsLoggedIn(false)
    try {
      localStorage.removeItem(STORAGE_KEY_PERSON)
      localStorage.removeItem(STORAGE_KEY_LOGGED_IN)
    } catch {
      /* ignore */
    }
  }, [])

  const changePin = useCallback(
    (oldPin, newPin, confirmPin) => {
      if (!person || !isLoggedIn) {
        return { ok: false, error: 'Not logged in.' }
      }

      const expected = getStoredPin(person)
      if (String(oldPin).trim() !== String(expected)) {
        return { ok: false, error: 'PIN lama salah.' }
      }

      const next = String(newPin).trim()
      const confirm = String(confirmPin).trim()

      if (!/^\d{4,}$/.test(next)) {
        return { ok: false, error: 'PIN baru minimal 4 digit angka.' }
      }
      if (next !== confirm) {
        return { ok: false, error: 'Konfirmasi PIN tidak sama.' }
      }

      const config = getPersonConfig(person)
      try {
        localStorage.setItem(config.pinKey, next)
      } catch {
        return { ok: false, error: 'Something went wrong. Please try again.' }
      }

      return { ok: true }
    },
    [person, isLoggedIn]
  )

  const value = useMemo(
    () => ({
      person,
      personName: person ? getPersonName(person) : null,
      hasPerson: Boolean(person) && isLoggedIn,
      isLoggedIn,
      login,
      logout,
      changePin,
    }),
    [person, isLoggedIn, login, logout, changePin]
  )

  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>
}

export function usePerson() {
  const ctx = useContext(PersonContext)
  if (!ctx) throw new Error('usePerson must be used within PersonProvider')
  return ctx
}
