
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Briefcase, ArrowRight, X, Mic } from 'lucide-react'
import { uploadIntake } from '../../lib/api.ts'
import { useInterviewStore } from '../../store/interviewStore.ts'
import LoadingSpinner from '../ui/LoadingSpinner.tsx'

export default function UploadForm() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [maxQuestions, setMaxQuestions] = useState(5)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    setPhase,
    setInterviewId,
    setCandidateInfo,
    setJobDescription: storeSetJD,
    setTotalQuestions,
    setVoiceId,
    voiceId,
    setError,
  } = useInterviewStore()

  const VOICE_OPTIONS = [
    { id: 'edge-jenny', name: 'Jenny', gender: 'Female', accent: 'International', emoji: '👩‍💼' },
    { id: 'edge-neerja', name: 'Neerja', gender: 'Female', accent: 'Indian', emoji: '👩‍💻' },
    { id: 'edge-prabhat', name: 'Prabhat', gender: 'Male', accent: 'Indian', emoji: '👨‍💼' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setResumeFile(file)
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setResumeFile(file)
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleSubmit = async () => {
    if (!resumeFile || !jobDescription.trim()) return

    setLoading(true)
    setPhase('uploading')

    try {
      const result = await uploadIntake(resumeFile, jobDescription, maxQuestions)
      setInterviewId(result.interviewId)
      setCandidateInfo(result.candidateName, result.resumeHighlights)
      storeSetJD(jobDescription)
      setTotalQuestions(maxQuestions)
      setPhase('ready')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'Upload failed')
      setPhase('home')
    } finally {
      setLoading(false)
    }
  }

  const isValid = resumeFile && jobDescription.trim().length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Resume Upload */}
      <div>
        <label className="flex items-center gap-2 text-slate-300 font-medium mb-3">
          <FileText size={18} className="text-primary-400" />
          Resume (PDF)
        </label>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${resumeFile
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-slate-700 hover:border-primary-500/50 hover:bg-primary-500/5'
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {resumeFile ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-primary-400" />
              </div>
              <div className="text-left">
                <p className="text-slate-200 font-medium">{resumeFile.name}</p>
                <p className="text-slate-500 text-sm">
                  {(resumeFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setResumeFile(null)
                }}
                className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                <Upload size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-300 font-medium">
                Drop your resume here or click to browse
              </p>
              <p className="text-slate-500 text-sm">PDF files only, max 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="flex items-center gap-2 text-slate-300 font-medium mb-3">
          <Briefcase size={18} className="text-primary-400" />
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={5}
          className="input-field resize-none"
        />
        <p className="text-slate-600 text-xs mt-1 text-right">
          {jobDescription.length} characters
        </p>
      </div>

      {/* Question Count Selection */}
      <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 space-y-3">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-slate-400">Total Questions</span>
          <span className="text-primary-400">{maxQuestions}</span>
        </div>
        <input 
          type="range"
          min="1"
          max="15"
          step="1"
          value={maxQuestions}
          onChange={(e) => setMaxQuestions(parseInt(e.target.value))}
          className="w-full h-1.5 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-tight">
          <span>Short (1-4)</span>
          <span>Balanced (5-8)</span>
          <span>In-depth (9+)</span>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-slate-300 font-medium">
          <Mic size={18} className="text-primary-400" />
          Interviewer Voice
        </label>
        <div className="grid grid-cols-3 gap-3">
          {VOICE_OPTIONS.map((voice) => (
            <motion.button
              key={voice.id}
              type="button"
              onClick={() => setVoiceId(voice.id)}
              className={`relative p-4 rounded-xl border-2 transition-all text-center space-y-1 ${
                voiceId === voice.id
                  ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'border-slate-700/50 bg-dark-900/50 hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {voiceId === voice.id && (
                <motion.div
                  layoutId="voiceIndicator"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <span className="text-white text-[10px]">✓</span>
                </motion.div>
              )}
              <div className="text-2xl">{voice.emoji}</div>
              <p className={`text-sm font-semibold ${voiceId === voice.id ? 'text-primary-300' : 'text-slate-200'}`}>
                {voice.name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {voice.gender} · {voice.accent}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {loading ? (
          <LoadingSpinner size="sm" text="Analyzing your resume..." />
        ) : (
          <>
            Start Interview Prep
            <ArrowRight size={18} />
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
