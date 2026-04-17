
import { motion, AnimatePresence } from 'framer-motion'
import { useInterviewStore } from '../store/interviewStore.ts'
import ReadyScreen from '../components/interview/ReadyScreen.tsx'
import QuestionPanel from '../components/interview/QuestionPanel.tsx'
import Scene from '../components/3d/Scene.tsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx'

export default function Interview() {
  const {
    phase,
    isRecording,
    isPlayingAudio,
    isProcessing,
    candidateName,
  } = useInterviewStore()

  const isSpeaking = isPlayingAudio
  const isListening = isRecording
  const isThinking = isProcessing

  const showWaveform = phase === 'interviewing'

  if (phase === 'starting') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Scene isSpeaking phase={phase} />
        <div className="relative z-10 text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-300 text-lg">Starting your interview...</p>
          <p className="text-slate-500 text-sm">Preparing questions based on your profile</p>
        </div>
      </div>
    )
  }

  if (phase === 'completing') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Scene isThinking phase={phase} />
        <div className="relative z-10 text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-300 text-lg">Generating your report...</p>
          <p className="text-slate-500 text-sm">Analyzing all your answers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* 3D Background */}
      <Scene
        isListening={isListening}
        isSpeaking={isSpeaking}
        isThinking={isThinking}
        showWaveform={showWaveform}
        phase={phase}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between glass-dark border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-primary-400 animate-pulse' :
              isListening ? 'bg-green-400 animate-pulse' :
              isProcessing ? 'bg-yellow-400 animate-pulse' :
              'bg-slate-600'
            }`} />
            <span className="text-slate-400 text-sm">
              {isSpeaking ? 'AI is speaking...' :
               isListening ? 'Recording your answer...' :
               isProcessing ? 'Processing...' :
               'Your turn to answer'}
            </span>
          </div>
          {candidateName && (
            <span className="text-slate-400 text-sm">
              {candidateName}
            </span>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            {phase === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <ReadyScreen />
              </motion.div>
            )}

            {phase === 'interviewing' && (
              <motion.div
                key="interviewing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <QuestionPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
