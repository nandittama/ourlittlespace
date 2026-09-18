import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePerson } from '../context/PersonContext'

export function ProtectedRoute() {
  const { isLoggedIn } = usePerson()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isLoggedIn } = usePerson()

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
