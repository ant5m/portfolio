'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import Model from './Model'
import DayEnvironment from './DayEnvironment'
import NightEnvironment from './NightEnvironment'

const WALLS = ['front', 'right', 'back', 'left']

function Scene({ isDark, isAnimating }) {
  const orbitRef = useRef()
  return (
    <>
      <Suspense fallback={null}>
        <ambientLight intensity={isDark ? 0.4 : 0.6} />
        <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.6 : 1.2} castShadow />
        <Model modelPath="/assets/3D-Models/MatchaShop.glb" />
        {isDark ? <NightEnvironment /> : <DayEnvironment />}
        <OrbitControls
          ref={orbitRef}
          enableZoom={true}
          enablePan={false}
          enableRotate={!isAnimating}
          autoRotate={!isAnimating}
          autoRotateSpeed={2}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI * 0.4}
          maxPolarAngle={Math.PI * 0.6}
          dampingFactor={0.05}
        />
      </Suspense>
    </>
  )
}

export default function ThreeCanvas({ isDark }) {
  const [wall, setWall] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timeout = useRef()

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      if (animating) return
      const dir = e.deltaY > 0 ? 1 : -1
      const next = (wall + dir + WALLS.length) % WALLS.length
      setWall(next)
      setAnimating(true)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setAnimating(false), 1000)
    }

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [wall, animating])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }} style={{ width: '100%', height: '100%' }} dpr={Math.min(window.devicePixelRatio, 1.5)}>
        <Scene isDark={isDark} isAnimating={animating} />
      </Canvas>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 105, 180, 0.9)', color: 'white', padding: '20px 30px', borderRadius: '12px', fontSize: '32px', fontWeight: 'bold', zIndex: 100, pointerEvents: 'none', opacity: animating ? 1 : 0.2, transition: 'opacity 0.3s' }}>
        {WALLS[wall].toUpperCase()}
      </div>
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', zIndex: 100, textAlign: 'center' }}>
        Scroll Up/Down to cycle walls
      </div>
    </div>
  )
}
