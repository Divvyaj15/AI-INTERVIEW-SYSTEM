
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
  color?: string
}

export default function ParticleField({ count = 200, color = '#6366f1' }: ParticleFieldProps) {
  const mesh = useRef<THREE.Points>(null)

  const [positions, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      speeds[i] = Math.random() * 0.5 + 0.1
    }
    return [positions, speeds]
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((state) => {
    if (!mesh.current) return
    const pos = mesh.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.005
      pos[i * 3] += Math.sin(time * 0.5 + i) * 0.001
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
    mesh.current.rotation.y = time * 0.02
  })

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}
