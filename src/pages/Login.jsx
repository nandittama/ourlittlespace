import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_NAME, PERSONS } from '../config'
import { usePerson } from '../context/PersonContext'

export default function Login() {
  const { login } = usePerson()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(PERSONS[0].key)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(selected, pin)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <p className="auth-card__eyebrow">Welcome</p>
        <h1>
          {APP_NAME} <span aria-hidden="true">❤️</span>
        </h1>
        <p className="muted">Masuk dengan PIN kamu.</p>

        <form className="form" onSubmit={handleSubmit}>
          <fieldset className="person-select">
            <legend>Siapa kamu?</legend>
            <div className="person-picker__grid">
              {PERSONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`person-picker__btn ${selected === p.key ? 'person-picker__btn--active' : ''}`}
                  onClick={() => setSelected(p.key)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            PIN
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="••••"
              required
              minLength={4}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn btn--primary btn--block">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
