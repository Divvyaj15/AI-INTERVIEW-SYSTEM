import { elevenlabs, VOICE_ID } from '../lib/elevenlabs.js'

export async function synthesizeSpeech(text: string, voiceId?: string): Promise<string> {
  const targetVoice = voiceId ?? VOICE_ID

  const audio = await elevenlabs.generate({
    voice: targetVoice,
    text,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true,
    },
  })

  // Collect streaming chunks into a buffer
  const chunks: Buffer[] = []
  for await (const chunk of audio) {
    chunks.push(Buffer.from(chunk))
  }

  const audioBuffer = Buffer.concat(chunks)
  return audioBuffer.toString('base64')
}