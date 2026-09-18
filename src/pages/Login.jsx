import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_NAME, PERSONS } from '../config'
import { usePerson } from '../context/PersonContext'

const PIN_LENGTH = 4

export default function Login() {
  const { login } = usePerson()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(PERSONS[0].key)
  const [digits, setDigits] = useState(Array(PIN_LENGTH).fill(''))
  const [error, setError] = useState('')
  const inputsRef = useRef([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const tryLogin = (personKey, pinValue) => {
    setError('')
    const result = login(personKey, pinValue)
    if (!result.ok) {
      setError(result.error)
      setDigits(Array(PIN_LENGTH).fill(''))
      inputsRef.current[0]?.focus()
      return
    }
    navigate('/', { replace: true })
  }

  const updateDigit = (index, raw) => {
    const value = raw.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError('')

    if (value && index < PIN_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }

    const pinValue = next.join('')
    if (pinValue.length === PIN_LENGTH && next.every(Boolean)) {
      tryLogin(selected, pinValue)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH)
    if (!pasted) return
    const next = Array(PIN_LENGTH).fill('')
    pasted.split('').forEach((ch, i) => {
      next[i] = ch
    })
    setDigits(next)
    if (pasted.length === PIN_LENGTH) {
      tryLogin(selected, pasted)
    } else {
      inputsRef.current[pasted.length]?.focus()
    }
  }

  const selectPerson = (key) => {
    setSelected(key)
    setDigits(Array(PIN_LENGTH).fill(''))
    setError('')
    inputsRef.current[0]?.focus()
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <p className="auth-card__eyebrow">Welcome</p>
        <h1>
          {APP_NAME} <span aria-hidden="true">❤️</span>
        </h1>
        <p className="muted">Pilih nama, lalu masukkan PIN.</p>

        <div className="form">
          <fieldset className="person-select">
            <legend>Siapa kamu?</legend>
            <div className="person-picker__grid">
              {PERSONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`person-picker__btn ${selected === p.key ? 'person-picker__btn--active' : ''}`}
                  onClick={() => selectPerson(p.key)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="pin-field">
            <p className="pin-field__label">PIN</p>
            <div className="pin-boxes" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el
                  }}
                  className="pin-box"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  aria-label={`PIN digit ${index + 1}`}
                  onChange={(e) => updateDigit(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          <p className="muted pin-hint">PIN 4 digit — langsung masuk setelah diisi.</p>
        </div>
      </div>
    </div>
  )
}
