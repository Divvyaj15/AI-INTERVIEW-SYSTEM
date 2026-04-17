
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeMap = { sm: 24, md: 40, lg: 64 }
  const px = sizeMap[size]

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="rounded-full border-2 border-primary-500/20 border-t-primary-500"
        style={{ width: px, height: px }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-slate-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
}
