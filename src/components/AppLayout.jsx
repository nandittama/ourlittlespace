import { Outlet, Link, useLocation } from 'react-router-dom'
import { APP_NAME } from '../config'

export default function AppLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={`app-shell ${isHome ? 'app-shell--home' : 'app-shell--page'}`}>
      {!isHome ? (
        <header className="page-top">
          <Link to="/" className="page-top__back">
            ← Home
          </Link>
          <Link to="/" className="page-top__brand">
            {APP_NAME}
          </Link>
          <Link to="/profile" className="page-top__link">
            Us
          </Link>
        </header>
      ) : null}
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
