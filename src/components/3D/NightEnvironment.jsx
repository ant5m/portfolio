'use client'
import { useMemo } from 'react'

export default function NightEnvironment() {
  const stars = useMemo(() => 
    Array.from({ length: 50 }, () => ({
      x: (Math.random() - 0.5) * 50,
      y: Math.random() * 30,
      z: (Math.random() - 0.5) * 50,
      size: Math.random() * 0.05 + 0.02,
    })), 
  [])

  return (
    <>
      <color attach="background" args={['#0a0e27']} />

      <mesh position={[15, 15, -10]} scale={1.5}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color="#E0E0E0" />
      </mesh>

      {stars.map((star, i) => (
        <mesh key={i} position={[star.x, star.y, star.z]}>
          <sphereGeometry args={[star.size, 4, 4]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
    </>
  )
}
