
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, MessageSquare, RotateCcw, Download } from 'lucide-react'
import { useInterviewStore } from '../../store/interviewStore.ts'
import ScoreRing from '../ui/ScoreRing.tsx'

export default function ResultsDashboard() {
  const {
    overallScore,
    grade,
    marketPosition,
    finalReport,
    candidateName,
    conversation,
    reset,
  } = useInterviewStore()

  const score = overallScore ?? 0

  const scoreColor =
    score >= 80 ? 'text-green-400' :
    score >= 60 ? 'text-primary-400' :
    score >= 40 ? 'text-yellow-400' :
    'text-red-400'

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto border border-yellow-500/30">
          <Trophy size={32} className="text-yellow-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">
          Interview Complete!
        </h2>
        <p className="text-slate-400">
          Here's how {candidateName || 'you'} performed
        </p>
      </motion.div>

      {/* Overall score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card flex flex-col md:flex-row items-center gap-8"
      >
        <ScoreRing score={score} size={160} strokeWidth={10} />

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">
              Overall Performance
            </p>
            <p className={`text-4xl font-bold ${scoreColor}`}>
              {grade}
            </p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Market Position
            </p>
            <p className="text-slate-200 text-sm">{marketPosition}</p>
          </div>
        </div>
      </motion.div>

      {/* Criteria scores */}
      {conversation.length > 0 && conversation[0].criteriaScores && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card space-y-4"
        >
          <h3 className="text-white font-semibold flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Average Criteria Scores
          </h3>
          {(() => {
            // Average criteria scores across all turns
            const allCriteria: Record<string, number[]> = {}
            conversation.forEach(turn => {
              if (turn.criteriaScores) {
                Object.entries(turn.criteriaScores).forEach(([key, val]) => {
                  if (!allCriteria[key]) allCriteria[key] = []
                  allCriteria[key].push(val)
                })
              }
            })
            const avgCriteria = Object.entries(allCriteria).map(([key, vals]) => ({
              key,
              avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
            }))

            return avgCriteria.map(({ key, avg }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 capitalize">{key}</span>
                  <span className={avg >= 70 ? 'text-green-400' : avg >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                    {avg}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      avg >= 70 ? 'bg-green-500' :
                      avg >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${avg}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            ))
          })()}
        </motion.div>
      )}

      {/* Final report */}
      {finalReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card space-y-3"
        >
          <h3 className="text-white font-semibold flex items-center gap-2">
            <MessageSquare size={18} className="text-primary-400" />
            Interviewer Report
          </h3>
          <p className="text-slate-300 leading-relaxed text-sm">{finalReport}</p>
        </motion.div>
      )}

      {/* Per-question breakdown */}
      {conversation.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <h3 className="text-white font-semibold">Question Breakdown</h3>
          {conversation.map((turn, i) => (
            <div key={turn.questionId} className="card space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                    Question {i + 1}
                  </p>
                  <p className="text-slate-200 font-medium text-sm">{turn.question}</p>
                </div>
                <div className="text-center shrink-0">
                  <ScoreRing score={turn.score} size={56} strokeWidth={5} />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Your answer</p>
                <p className="text-slate-300 text-sm line-clamp-3">{turn.answer}</p>
              </div>

              <div className="bg-primary-900/20 border border-primary-500/20 rounded-xl p-3">
                <p className="text-primary-400 text-xs mb-1">Feedback</p>
                <p className="text-slate-300 text-sm">{turn.feedback}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-4 pb-8"
      >
        <button
          onClick={reset}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          Start New Interview
        </button>
        <button
          onClick={() => window.print()}
          className="btn-secondary flex items-center gap-2 px-4"
        >
          <Download size={18} />
        </button>
      </motion.div>
    </div>
  )
}
