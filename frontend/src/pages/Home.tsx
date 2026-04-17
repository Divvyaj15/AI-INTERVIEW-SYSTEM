
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.ts'
import Scene from '../components/3d/Scene.tsx'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // ── Parallax logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX - innerWidth / 2) / 30
      const y = (clientY - innerHeight / 2) / 30
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handlePulse = (e: React.MouseEvent) => {
    const ripple = document.createElement('div')
    ripple.className = 'ripple'
    ripple.style.left = `${e.clientX - 25}px`
    ripple.style.top = `${e.clientY - 25}px`
    document.body.appendChild(ripple)
    setTimeout(() => ripple.remove(), 800)
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/auth')
    }
  }

  // ── Render Landing Page (Guest) ──────────────────────────────────────────────
  return (
    <div 
      className="min-h-screen bg-dark-950 text-white overflow-hidden relative cursor-crosshair"
      onClick={handlePulse}
    >
      <Scene phase={isAuthenticated ? 'dashboard' : 'home'} />
      <div className="fixed inset-0 nebula pointer-events-none opacity-60" />
      
      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* Core Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 perspective-1000">
          <motion.div 
            animate={{ 
              x: mousePos.x * 0.4,
              y: mousePos.y * 0.4
            }}
            className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full"
            style={{ 
              background: 'radial-gradient(circle at 30% 30%, #6366f1, #020617)',
              boxShadow: '0 0 100px rgba(99,102,241,0.2), inset -20px -20px 60px rgba(0,0,0,0.8)',
            }}
          />
        </div>

        {/* Content */}
        <div 
          className="text-center space-y-8 max-w-4xl"
          style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border-white/10"
          >
            <Sparkles size={14} className="text-primary-400" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Next-Gen Interview Prep</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl md:text-[100px] font-black tracking-tighter leading-none"
            >
              The <span className="text-gradient">Interviewer</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg md:text-xl text-slate-400 font-medium max-w-xl mx-auto"
            >
              Master your career conversations with our 3D antigravity AI feedback engine.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6"
          >
            <button 
              onClick={handleGetStarted}
              className="group relative px-10 py-4 bg-primary-600 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {isAuthenticated ? 'Start Interview' : 'Get Started'}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </motion.div>
        </div>

      </main>

      <footer className="absolute bottom-8 left-0 right-0 text-center opacity-30 pointer-events-none">
        <p className="text-[9px] tracking-[0.5em] text-slate-500 uppercase">
          built with intelligence · © 2026
        </p>
      </footer>
    </div>
  )
}
