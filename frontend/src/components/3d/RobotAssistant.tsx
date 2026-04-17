
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface RobotAssistantProps {
  isListening?: boolean
  isSpeaking?: boolean
  isThinking?: boolean
}

export default function RobotAssistant({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
}: RobotAssistantProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const jawRef = useRef<THREE.Mesh>(null)
  const leftEyeRef = useRef<THREE.Mesh>(null)
  const rightEyeRef = useRef<THREE.Mesh>(null)
  const { mouse, viewport } = useThree()

  // ── Color Selection ────────────────────────────────────────────────────────
  const color = useMemo(() => {
    if (isSpeaking) return new THREE.Color('#818cf8') // Indigo
    if (isListening) return new THREE.Color('#34d399') // Green
    if (isThinking) return new THREE.Color('#fbbf24') // Amber
    return new THREE.Color('#6366f1') // Default Blue
  }, [isSpeaking, isListening, isThinking])

  // ── Animation Loop ──────────────────────────────────────────────────────────
  useFrame((state) => {
    const time = state.clock.elapsedTime

    // 1. Mouse Tracking (Head Look-At)
    if (headRef.current) {
      const targetX = (mouse.x * viewport.width) / 8
      const targetY = (mouse.y * viewport.height) / 8
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1)
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.1)
    }

    // 2. Jaw Movement (Speech Animation)
    if (jawRef.current) {
      const jawMotion = isSpeaking ? Math.sin(time * 15) * 0.15 - 0.1 : -0.1
      jawRef.current.position.y = THREE.MathUtils.lerp(jawRef.current.position.y, jawMotion, 0.2)
    }

    // 3. Eyes Pulsing
    const eyeScale = 1 + Math.sin(time * (isThinking ? 10 : 2)) * 0.1
    if (leftEyeRef.current) leftEyeRef.current.scale.setScalar(eyeScale)
    if (rightEyeRef.current) rightEyeRef.current.scale.setScalar(eyeScale)
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={groupRef}>
        
        {/* ── Head Assembly ─────────────────────────────────────────────────── */}
        <group ref={headRef}>
          {/* Main Skull */}
          <Sphere args={[1, 64, 64]}>
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.1} 
              metalness={0.9} 
              envMapIntensity={1}
            />
          </Sphere>

          {/* Visor / Face Plate */}
          <mesh position={[0, 0, 0.5]}>
            <RoundedBox args={[1.4, 0.6, 0.2]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color="#0f172a" roughness={0} metalness={1} />
            </RoundedBox>
          </mesh>

          {/* Eyes */}
          <group position={[0, 0.1, 0.6]}>
            <mesh ref={leftEyeRef} position={[-0.35, 0, 0]}>
              <planeGeometry args={[0.25, 0.08]} />
              <meshBasicMaterial color={color} />
              <pointLight color={color} intensity={1} distance={2} />
            </mesh>
            <mesh ref={rightEyeRef} position={[0.35, 0, 0]}>
              <planeGeometry args={[0.25, 0.08]} />
              <meshBasicMaterial color={color} />
              <pointLight color={color} intensity={1} distance={2} />
            </mesh>
          </group>

          {/* Voice / Jaw Plate */}
          <mesh ref={jawRef} position={[0, -0.6, 0.4]}>
            <RoundedBox args={[0.8, 0.2, 0.3]} radius={0.05} smoothness={4}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSpeaking ? 2 : 0.5} />
            </RoundedBox>
          </mesh>
        </group>

        {/* ── Body Structures ──────────────────────────────────────────────── */}
        
        {/* Neck Rings */}
        <group position={[0, -1.2, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.04, 16, 100]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.03, 16, 100]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>

        {/* Ambient Glow */}
        <Sphere args={[2, 32, 32]}>
          <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.BackSide} />
        </Sphere>

      </group>
    </Float>
  )
}
