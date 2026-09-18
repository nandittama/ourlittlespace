import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePerson } from '../context/PersonContext'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { personName, logout, changePin } = usePerson()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleChangePin = (e) => {
    e.preventDefault()
    const result = changePin(oldPin, newPin, confirmPin)
    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }
    setOldPin('')
    setNewPin('')
    setConfirmPin('')
    showToast('PIN berhasil diganti.', 'success')
  }

  return (
    <div className="page fade-in">
      <header className="page-header">
        <h1>Profile</h1>
        <p className="muted">Akun yang sedang dipakai.</p>
      </header>

      <section className="panel">
        <p className="profile-name">{personName}</p>
        <button type="button" className="btn btn--secondary" onClick={handleLogout}>
          Logout
        </button>
      </section>

      <section className="panel">
        <h2>Ganti PIN</h2>
        <p className="muted">PIN disimpan di perangkat ini saja.</p>
        <form className="form" onSubmit={handleChangePin}>
          <label>
            PIN lama
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
              minLength={4}
            />
          </label>
          <label>
            PIN baru
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
              minLength={4}
            />
          </label>
          <label>
            Konfirmasi PIN baru
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
              minLength={4}
            />
          </label>
          <button type="submit" className="btn btn--primary">
            Simpan PIN
          </button>
        </form>
      </section>
    </div>
  )
}
