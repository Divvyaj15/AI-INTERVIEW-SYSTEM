
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInterviewStore } from '../store/interviewStore.ts'
import ResultsDashboard from '../components/results/ResultsDashboard.tsx'
import Scene from '../components/3d/Scene.tsx'

export default function Results() {
  const navigate = useNavigate()
  const { phase, overallScore } = useInterviewStore()

  useEffect(() => {
    if (phase === 'home') {
      navigate('/')
    }
  }, [phase, navigate])

  return (
    <div className="min-h-screen relative">
      {/* Subtle 3D background */}
      <Scene phase="results" />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="px-6 py-4 glass-dark border-b border-white/5 sticky top-0 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center border border-primary-500/30">
                <span className="text-primary-400 text-sm font-bold">AI</span>
              </div>
              <span className="text-white font-semibold">Interview Results</span>
            </div>
            {overallScore !== null && (
              <div className="glass rounded-lg px-3 py-1.5">
                <span className="text-slate-400 text-xs">Score: </span>
                <span className={`text-sm font-bold ${
                  overallScore >= 75 ? 'text-green-400' :
                  overallScore >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {overallScore}/100
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Results dashboard */}
        <main className="px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto"
          >
            <ResultsDashboard />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
