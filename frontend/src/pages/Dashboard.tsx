
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useInterviewStore } from '../store/interviewStore.ts'
import { useAuthStore } from '../store/authStore.ts'
import UploadForm from '../components/interview/UploadForm.tsx'
import { LogOut, ArrowLeft } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { phase } = useInterviewStore()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4 relative">
      <div className="nebula fixed inset-0 pointer-events-none opacity-40" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-slate-500 text-xs hidden sm:inline">{user.email}</span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {phase === 'uploading' ? (
        <div className="text-center space-y-6 relative z-10">
          <motion.div
            className="w-20 h-20 rounded-full border-2 border-primary-500/20 border-t-primary-500 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <h2 className="text-2xl font-bold text-gradient">Analyzing Materials...</h2>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl relative z-10"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">New Interview Session</h1>
            <p className="text-slate-400 text-lg">Upload your resume and the job targeted for practice.</p>
          </div>
          <div className="card bg-dark-900/40 backdrop-blur-2xl border-white/5 shadow-2xl">
            <UploadForm />
          </div>
        </motion.div>
      )}
    </div>
  )
}
