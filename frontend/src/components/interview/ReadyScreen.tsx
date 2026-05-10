import { motion } from 'framer-motion'
import { User, Briefcase, Mic, ArrowRight, CheckCircle } from 'lucide-react'
import { useInterviewStore } from '../../store/interviewStore.ts'
import { startInterview } from '../../lib/api.ts'
import { playBase64Audio } from '../../lib/audio.ts'
import { useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner.tsx'

export default function ReadyScreen() {
  const [loading, setLoading] = useState(false)

  const {
    interviewId,
    candidateName,
    resumeHighlights,
    jobDescription,
    totalQuestions,
    voiceId,
    setPhase,
    setCurrentQuestion,
    setError,
    setPlayingAudio,
  } = useInterviewStore()

  const handleStart = async () => {
    if (!interviewId) return
    setLoading(true)
    setPhase('starting')

    try {
      const result = await startInterview(interviewId, voiceId)
      setCurrentQuestion(result.firstQuestion, result.questionId)

      // Play greeting audio
      setPlayingAudio(true)
      setPhase('interviewing')
      await playBase64Audio(result.audioBase64)
      setPlayingAudio(false)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'Failed to start interview')
      setPhase('ready')
    } finally {
      setLoading(false)
    }
  }

  const jobTitle = jobDescription.split('\n')[0].slice(0, 60)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto border border-primary-500/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CheckCircle size={32} className="text-primary-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Interview Ready!</h2>
        <p className="text-slate-400">Review your details before we begin</p>
      </div>

      {/* Candidate info */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <User size={20} className="text-primary-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Candidate</p>
            <p className="text-white font-semibold">{candidateName || 'You'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Role</p>
            <p className="text-white font-semibold">{jobTitle || 'Software Engineer'}</p>
          </div>
        </div>

        {resumeHighlights && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              AI Summary
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{resumeHighlights}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card space-y-3">
        <p className="text-slate-300 font-medium flex items-center gap-2">
          <Mic size={16} className="text-primary-400" />
          What to expect
        </p>
        {[
          `${totalQuestions} adaptive questions based on your resume and job description`,
          'Each answer is scored and you receive instant feedback',
          'Answer by speaking — click the microphone to record',
          'The AI interviewer will guide you through the entire session',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
            <p className="text-slate-400 text-sm">{item}</p>
          </div>
        ))}
      </div>

      {/* Start button */}
      <motion.button
        onClick={handleStart}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {loading ? (
          <LoadingSpinner size="sm" text="Starting interview..." />
        ) : (
          <>
            <Mic size={20} />
            Begin Interview
            <ArrowRight size={20} />
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
