import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

interface AvatarOrbProps {
  isListening?: boolean
  isSpeaking?: boolean
  isThinking?: boolean
}

export default function AvatarOrb({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
}: AvatarOrbProps) {
  const orbRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)

  const color = useMemo(() => {
    if (isSpeaking) return '#818cf8'
    if (isListening) return '#34d399'
    if (isThinking) return '#f59e0b'
    return '#6366f1'
  }, [isSpeaking, isListening, isThinking])

  const distort = useMemo(() => {
    if (isSpeaking) return 0.6
    if (isListening) return 0.4
    if (isThinking) return 0.3
    return 0.2
  }, [isSpeaking, isListening, isThinking])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (ringRef.current) {
      ringRef.current.rotation.x = time * 0.5
      ringRef.current.rotation.y = time * 0.3
      ringRef.current.scale.setScalar(
        1 + Math.sin(time * (isSpeaking ? 3 : 1)) * 0.05
      )
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = -time * 0.3
      outerRingRef.current.rotation.z = time * 0.4
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Outer glow ring */}
        <mesh ref={outerRingRef}>
          <torusGeometry args={[1.6, 0.02, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>

        {/* Middle ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.3, 0.03, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>

        {/* Main orb */}
        <Sphere ref={orbRef} args={[0.9, 64, 64]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={distort}
            speed={isSpeaking ? 4 : 2}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Inner glow */}
        <Sphere args={[0.7, 32, 32]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
          />
        </Sphere>

        {/* Point light for glow effect */}
        <pointLight color={color} intensity={2} distance={5} />
      </group>
    </Float>
  )
}
