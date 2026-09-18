import { NavLink } from 'react-router-dom'
import { APP_NAME } from '../config'
import { usePerson } from '../context/PersonContext'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/mood', label: 'Mood' },
  { to: '/notes', label: 'Notes' },
  { to: '/things-to-do', label: 'Things To Do' },
  { to: '/memories', label: 'Memories' },
  { to: '/date-ideas', label: 'Surprise Me' },
]

export default function Sidebar() {
  const { personName, hasPerson, switchPerson, clearPerson } = usePerson()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          {APP_NAME} <span aria-hidden="true">❤️</span>
        </span>
        <p className="sidebar__user">{hasPerson ? personName : 'Welcome'}</p>
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

      {hasPerson ? (
        <div className="sidebar__footer">
          <button type="button" className="btn btn--ghost btn--block" onClick={switchPerson}>
            Switch person
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={clearPerson}>
            Change identity
          </button>
        </div>
      ) : null}
    </aside>
  )
}
