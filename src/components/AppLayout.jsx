import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { APP_NAME } from '../config'
import { usePerson } from '../context/PersonContext'

export default function AppLayout() {
  const { personName } = usePerson()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="mobile-header mobile-header--minimal">
          <Link to="/" className="mobile-header__brand">
            {APP_NAME} <span aria-hidden="true">❤️</span>
          </Link>
          <Link to="/profile" className="avatar avatar--sm" aria-label="Profile">
            {(personName || 'U').slice(0, 1)}
          </Link>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
