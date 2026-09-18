import { PersonProvider } from './context/PersonContext'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home'

export default function App() {
  return (
    <PersonProvider>
      <ToastProvider>
        <Home />
      </ToastProvider>
    </PersonProvider>
  )
}
