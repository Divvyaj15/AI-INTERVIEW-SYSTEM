
import { Canvas } from '@react-three/fiber'
import { Environment, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import AvatarOrb from './AvatarOrb.tsx'
import RobotAssistant from './RobotAssistant.tsx'
import ParticleField from './ParticleField.tsx'
import WaveformVisualizer from './WaveformVisualizer.tsx'

interface SceneProps {
  isListening?: boolean
  isSpeaking?: boolean
  isThinking?: boolean
  showWaveform?: boolean
  phase?: string
}

export default function Scene({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  showWaveform = false,
  phase = 'home',
}: SceneProps) {
  const orbColor = isSpeaking
    ? '#818cf8'
    : isListening
    ? '#34d399'
    : isThinking
    ? '#f59e0b'
    : '#6366f1'

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

          {/* Particle field */}
          <ParticleField count={100} color={orbColor} />

          {/* Main Interviewer Robot */}
          <group position={[0, phase === 'home' ? -0.5 : 0, 0]}>
            <RobotAssistant
              isListening={isListening}
              isSpeaking={isSpeaking}
              isThinking={isThinking}
            />
          </group>

          {/* Environment lighting */}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
