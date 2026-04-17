// ── Audio Playback ────────────────────────────────────────────────────────────

let currentAudio: HTMLAudioElement | null = null

export function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
      }

      const audio = new Audio(`data:audio/mpeg;base64,${base64}`)
      currentAudio = audio

      audio.onended = () => {
        currentAudio = null
        resolve()
      }

      audio.onerror = (e) => {
        currentAudio = null
        reject(new Error('Audio playback failed'))
      }

      audio.play().catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

// ── Audio Recording ───────────────────────────────────────────────────────────

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let stream: MediaStream | null = null

export async function startRecording(): Promise<void> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? { mimeType: 'audio/webm;codecs=opus' }
      : MediaRecorder.isTypeSupported('audio/webm')
      ? { mimeType: 'audio/webm' }
      : {}

    mediaRecorder = new MediaRecorder(stream, options)
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.start(100)
  } catch (err) {
    throw new Error('Microphone access denied. Please allow microphone access.')
  }
}

export function stopRecording(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('No active recording'))
      return
    }

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder?.mimeType ?? 'audio/webm'
      const audioBlob = new Blob(audioChunks, { type: mimeType })

      // Clean up stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null
      }

      mediaRecorder = null
      audioChunks = []
      resolve(audioBlob)
    }

    mediaRecorder.stop()
  })
}

export function isRecording(): boolean {
  return mediaRecorder?.state === 'recording'
}

// ── Analyser for waveform visualization ──────────────────────────────────────

let analyser: AnalyserNode | null = null
let audioContext: AudioContext | null = null

export function getAnalyser(): AnalyserNode | null {
  return analyser
}

export async function startRecordingWithAnalyser(): Promise<AnalyserNode> {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true })

  audioContext = new AudioContext()
  const source = audioContext.createMediaStreamSource(stream)
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 256
  source.connect(analyser)

  const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? { mimeType: 'audio/webm;codecs=opus' }
    : {}

  mediaRecorder = new MediaRecorder(stream, options)
  audioChunks = []

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data)
  }

  mediaRecorder.start(100)
  return analyser
}

export function stopRecordingWithAnalyser(): Promise<Blob> {
  if (audioContext) {
    audioContext.close()
    audioContext = null
    analyser = null
  }
  return stopRecording()
}