
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WaveformVisualizerProps {
  isActive?: boolean
  color?: string
  barCount?: number
}

export default function WaveformVisualizer({
  isActive = false,
  color = '#6366f1',
  barCount = 32,
}: WaveformVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const barsRef = useRef<THREE.Mesh[]>([])

  const positions = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const angle = (i / barCount) * Math.PI * 2
      const radius = 2
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        baseAngle: angle,
      }
    })
  }, [barCount])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    barsRef.current.forEach((bar, i) => {
      if (!bar) return
      const speed = isActive ? 3 : 0.5
      const amplitude = isActive ? 0.4 : 0.05
      const height =
        0.1 + Math.abs(Math.sin(time * speed + i * 0.3)) * amplitude +
        Math.abs(Math.sin(time * speed * 1.5 + i * 0.5)) * amplitude * 0.5

      bar.scale.y = height * 10
      bar.position.y = (height * 10) / 2
    })

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          position={[pos.x, 0, pos.z]}
          ref={(el) => {
            if (el) barsRef.current[i] = el
          }}
        >
          <boxGeometry args={[0.08, 0.1, 0.08]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isActive ? 0.8 : 0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
