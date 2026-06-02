import { useRef } from 'react'

export default function DayEnvironment() {
  return (
    <>
      {/* Sun */}
      <mesh position={[8, 6, -2]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Clouds */}
      {[
        { pos: [5, 5, 3], scale: 1.2 },
        { pos: [-4, 4.5, 2], scale: 1.5 },
        { pos: [2, 5.5, -4], scale: 1 }
      ].map((cloud, i) => (
        <mesh key={i} position={cloud.pos} scale={cloud.scale}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshBasicMaterial color="rgba(255, 255, 255, 0.7)" transparent />
        </mesh>
      ))}

      {/* Sky color from ambient light - handled in Canvas */}
    </>
  )
}
