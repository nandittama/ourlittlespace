import { NavLink, useNavigate } from 'react-router-dom'
import { APP_NAME, PERSON_ONE_NAME, PERSON_TWO_NAME } from '../config'
import { usePerson } from '../context/PersonContext'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/mood', label: 'Mood' },
  { to: '/notes', label: 'Notes' },
  { to: '/things-to-do', label: 'Things To Do' },
  { to: '/memories', label: 'Memories' },
  { to: '/profile', label: 'Us' },
]

export default function Sidebar() {
  const { personName, logout, loginDisabled } = usePerson()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    if (!loginDisabled) navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          {APP_NAME} <span aria-hidden="true">❤️</span>
        </span>
        <p className="sidebar__user">
          {PERSON_ONE_NAME} & {PERSON_TWO_NAME}
        </p>
        <p className="sidebar__you">Signed in as {personName}</p>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {!loginDisabled ? (
        <div className="sidebar__footer">
          <button type="button" className="btn btn--ghost btn--block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : null}
    </aside>
  )
}
