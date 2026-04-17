
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

interface ErrorBannerProps {
  error: string | null
  onDismiss: () => void
}

export default function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
        >
          <div className="flex items-start gap-3 bg-red-950/90 border border-red-500/30 rounded-xl p-4 backdrop-blur-xl shadow-xl">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-red-200 text-sm flex-1">{error}</p>
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-200 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
