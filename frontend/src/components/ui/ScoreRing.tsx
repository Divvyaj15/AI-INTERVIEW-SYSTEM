
import { motion } from 'framer-motion'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#34d399' :
    score >= 60 ? '#818cf8' :
    score >= 40 ? '#f59e0b' :
    '#f87171'

  const grade =
    score >= 90 ? 'Exceptional' :
    score >= 75 ? 'Strong' :
    score >= 60 ? 'Competent' :
    score >= 45 ? 'Developing' :
    'Needs Work'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>

        {/* Score text */}
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        )}
      </div>

      {showLabel && (
        <motion.span
          className="text-sm font-medium"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {grade}
        </motion.span>
      )}
    </div>
  )
}
