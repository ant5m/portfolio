'use client'

export default function DayEnvironment() {
  return (
    <>
      <color attach="background" args={['#87CEEB']} />

      {/* Sun - lower position */}
      <mesh position={[8, 4, -2]} scale={2}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>

      {/* Clouds - lower */}
      <Cloud position={[7, 3, -1]} scale={1.5} />
      <Cloud position={[-8, 2.5, 0]} scale={1.2} />
      <Cloud position={[2, 3.5, -3]} scale={1} />
    </>
  )
}

function Cloud({ position, scale }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}
