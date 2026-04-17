import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useInterviewStore } from './store/interviewStore.ts'
import { useAuthStore } from './store/authStore.ts'
import Home from './pages/Home.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Interview from './pages/Interview.tsx'
import Results from './pages/Results.tsx'
import Auth from './pages/Auth.tsx'
import ErrorBanner from './components/ui/ErrorBanner.tsx'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { phase, error, setError } = useInterviewStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Landing page (/) is always accessible — no redirect away from it
    if (location.pathname === '/') return

    // Redirect away from /auth if already logged in
    if (isAuthenticated && location.pathname === '/auth') {
      navigate('/dashboard')
      return
    }

    // Protect /dashboard — must be logged in
    if (!isAuthenticated && location.pathname === '/dashboard') {
      navigate('/auth')
      return
    }

    // Phase-based routing for interview flow
    if (
      (phase === 'ready' || phase === 'starting' || phase === 'interviewing' ||
       phase === 'processing' || phase === 'completing') &&
      location.pathname !== '/interview'
    ) {
      navigate('/interview')
    } else if (phase === 'results' && location.pathname !== '/results') {
      navigate('/results')
    }
  }, [phase, navigate, location.pathname, isAuthenticated])

  return (
    <div className="min-h-screen bg-dark-950">
      <ErrorBanner error={error} onDismiss={() => setError(null)} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
