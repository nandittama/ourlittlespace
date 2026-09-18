import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { APP_NAME } from '../config'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="mobile-header">
          <Link to="/" className="mobile-header__brand">
            {APP_NAME} <span aria-hidden="true">❤️</span>
          </Link>
          <Link to="/date-ideas" className="mobile-header__surprise" aria-label="Surprise Me">
            🎲
          </Link>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <Link to="/date-ideas" className="fab" aria-label="Surprise Me">
        🎲
      </Link>
    </div>
  )
}
