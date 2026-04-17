
import { motion } from 'framer-motion'

interface AudioWaveformProps {
  isActive: boolean
  barCount?: number
  color?: string
  height?: number
}

export default function AudioWaveform({
  isActive,
  barCount = 20,
  color = '#6366f1',
  height = 40,
}: AudioWaveformProps) {
  return (
    <div
      className="flex items-center gap-0.5"
      style={{ height }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={
            isActive
              ? {
                  scaleY: [0.3, 1.5, 0.3],
                  opacity: [0.5, 1, 0.5],
                }
              : {
                  scaleY: 0.3,
                  opacity: 0.3,
                }
          }
          transition={
            isActive
              ? {
                  duration: 0.8 + Math.random() * 0.4,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
          initial={{ scaleY: 0.3 }}
        />
      ))}
    </div>
  )
}
