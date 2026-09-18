import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', icon: '⌂', end: true },
  { to: '/mood', label: 'Mood', icon: '☺' },
  { to: '/notes', label: 'Notes', icon: '✎' },
  { to: '/things-to-do', label: 'To-Do', icon: '✓' },
  { to: '/memories', label: 'Memories', icon: '◇' },
  { to: '/profile', label: 'Us', icon: '♡' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            isActive ? 'bottom-nav__link bottom-nav__link--active' : 'bottom-nav__link'
          }
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            {link.icon}
          </span>
          <span className="bottom-nav__label">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
