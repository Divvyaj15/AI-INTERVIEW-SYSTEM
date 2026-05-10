import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Square, MessageSquare } from 'lucide-react'
import { useInterviewStore } from '../../store/interviewStore.ts'
import { submitAnswer, completeInterview } from '../../lib/api.ts'
import { startRecordingWithAnalyser, stopRecordingWithAnalyser, playBase64Audio } from '../../lib/audio.ts'
import AudioWaveform from '../ui/AudioWaveform.tsx'
import LoadingSpinner from '../ui/LoadingSpinner.tsx'

export default function QuestionPanel() {
  const [textAnswer, setTextAnswer] = useState('')
  const [useText, setUseText] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  const {
    interviewId,
    currentQuestion,
    currentQuestionId,
    questionNumber,
    totalQuestions,
    conversation,
    isRecording,
    isProcessing,
    isPlayingAudio,
    voiceId,
    setRecording,
    setProcessing,
    setCurrentQuestion,
    setPlayingAudio,
    addConversationTurn,
    incrementQuestion,
    setPhase,
    setError,
    setResults,
  } = useInterviewStore()

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [timerInterval])

  const handleStartRecording = async () => {
    try {
      setError(null)
      await startRecordingWithAnalyser()
      setRecording(true)
      setRecordingTime(0)
      const interval = setInterval(() => setRecordingTime(t => t + 1), 1000)
      setTimerInterval(interval)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStopAndSubmit = async () => {
    if (!interviewId || !currentQuestionId) return

    try {
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }

      setRecording(false)
      setProcessing(true)

      const audioBlob = await stopRecordingWithAnalyser()
      await processAnswer(audioBlob, undefined)
    } catch (err: any) {
      setError(err.message)
      setProcessing(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!interviewId || !currentQuestionId || !textAnswer.trim()) return

    setProcessing(true)
    setTextAnswer('')
    await processAnswer(null, textAnswer.trim())
  }

  const processAnswer = async (audioBlob: Blob | null, text?: string) => {
    if (!interviewId || !currentQuestionId) return

    try {
      const result = await submitAnswer(
        interviewId,
        currentQuestionId,
        audioBlob,
        text,
        voiceId
      )

      // Store conversation turn
      addConversationTurn({
        questionId: currentQuestionId,
        question: currentQuestion,
        answer: result.transcript,
        score: result.score,
        feedback: result.feedback,
        criteriaScores: result.criteriaScores,
        audioBase64: result.audioBase64,
      })

      incrementQuestion()

      if (result.isComplete) {
        // Play closing audio then go to completing phase
        if (result.audioBase64) {
          setPlayingAudio(true)
          await playBase64Audio(result.audioBase64)
          setPlayingAudio(false)
        }

        setPhase('completing')
        setProcessing(false)

        // Fetch final results
        const complete = await completeInterview(interviewId, voiceId)
        setResults(
          complete.overallScore,
          complete.grade,
          complete.marketPosition,
          complete.finalReport
        )

        if (complete.closingAudio) {
          setPlayingAudio(true)
          await playBase64Audio(complete.closingAudio)
          setPlayingAudio(false)
        }

        setPhase('results')
      } else {
        // Play feedback + next question audio
        if (result.audioBase64) {
          setPlayingAudio(true)
          await playBase64Audio(result.audioBase64)
          setPlayingAudio(false)
        }

        if (result.nextQuestion && result.nextQuestionId) {
          setCurrentQuestion(result.nextQuestion, result.nextQuestionId)
        }
        setProcessing(false)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'Failed to process answer')
      setProcessing(false)
    }
  }

  const progress = ((questionNumber - 1) / totalQuestions) * 100
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">
            Question <span className="text-white font-medium">{questionNumber}</span> of{' '}
            <span className="text-white font-medium">{totalQuestions}</span>
          </span>
          <span className="text-primary-400 font-medium">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <motion.div
            className="bg-gradient-to-r from-primary-600 to-primary-400 h-1.5 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="card"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare size={16} className="text-primary-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                AI Interviewer
              </p>
              <p className="text-white text-lg leading-relaxed font-medium">
                {isPlayingAudio ? (
                  <span className="flex items-center gap-2">
                    <AudioWaveform isActive height={24} barCount={12} />
                    <span className="text-slate-300 text-base">Speaking...</span>
                  </span>
                ) : (
                  currentQuestion
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer input */}
      {!isProcessing && !isPlayingAudio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Toggle input mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseText(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !useText
                  ? 'bg-primary-600 text-white'
                  : 'glass text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic size={14} className="inline mr-1.5" />
              Voice
            </button>
            <button
              onClick={() => setUseText(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                useText
                  ? 'bg-primary-600 text-white'
                  : 'glass text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={14} className="inline mr-1.5" />
              Type
            </button>
          </div>

          {/* Voice recording */}
          {!useText && (
            <div className="card flex flex-col items-center gap-4 py-8">
              {isRecording ? (
                <>
                  <AudioWaveform isActive barCount={24} height={48} />
                  <p className="text-slate-300 text-sm">
                    Recording... {formatTime(recordingTime)}
                  </p>
                  <motion.button
                    onClick={handleStopAndSubmit}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-medium transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square size={16} />
                    Stop & Submit
                  </motion.button>
                </>
              ) : (
                <>
                  <p className="text-slate-400 text-sm">
                    Click to start recording your answer
                  </p>
                  <motion.button
                    onClick={handleStartRecording}
                    className="w-20 h-20 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center glow-primary transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.4)', '0 0 40px rgba(99,102,241,0.7)', '0 0 20px rgba(99,102,241,0.4)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mic size={32} />
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* Text input */}
          {useText && (
            <div className="space-y-3">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={5}
                className="input-field resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleTextSubmit()
                }}
              />
              <motion.button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Send size={16} />
                Submit Answer
              </motion.button>
              <p className="text-slate-600 text-xs text-center">
                Ctrl+Enter to submit
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card flex flex-col items-center gap-4 py-8"
        >
          <LoadingSpinner size="lg" />
          <p className="text-slate-300">Evaluating your answer...</p>
          <p className="text-slate-500 text-sm">This may take a few seconds</p>
        </motion.div>
      )}

      {/* Recent conversation */}
      {conversation.length > 0 && (
        <div className="space-y-3">
          <p className="text-slate-500 text-xs uppercase tracking-wider">Previous answers</p>
          {conversation.slice(-2).map((turn, i) => (
            <motion.div
              key={turn.questionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 space-y-2"
            >
              <p className="text-slate-400 text-xs line-clamp-1">{turn.question}</p>
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-sm line-clamp-2 flex-1 mr-4">
                  {turn.answer}
                </p>
                <span
                  className={`text-lg font-bold shrink-0 ${
                    turn.score >= 75 ? 'text-green-400' :
                    turn.score >= 50 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}
                >
                  {turn.score}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
