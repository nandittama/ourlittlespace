import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PersonProvider } from './context/PersonContext'
import { ToastProvider } from './context/ToastContext'
import AppLayout from './components/AppLayout'
import Loading from './components/Loading'
import { isSupabaseConfigured } from './lib/supabase'
import ConnectionError from './components/ConnectionError'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Mood = lazy(() => import('./pages/Mood'))
const Notes = lazy(() => import('./pages/Notes'))
const ThingsToDo = lazy(() => import('./pages/ThingsToDo'))
const Memories = lazy(() => import('./pages/Memories'))
const DateIdeas = lazy(() => import('./pages/DateIdeas'))

function PageFallback() {
  return <Loading full label="Loading..." />
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConnectionError />
  }

  return (
    <PersonProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/mood" element={<Mood />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/things-to-do" element={<ThingsToDo />} />
                <Route path="/memories" element={<Memories />} />
                <Route path="/date-ideas" element={<DateIdeas />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </PersonProvider>
  )
}
